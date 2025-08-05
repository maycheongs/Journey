
import axios from 'axios';
import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
const account = process.env.ACCOUNT_ID;
const token = process.env.TOKEN;

import {
  parseAttractionObj,
  parseLocationName,
}  from '../utils/apiParsers.js';

export default ({
  getCoordinatesByLocationName,
  addThenGetAttraction,
  addAddress,
}) => {
  router.get('/:location_name/:query/:cat', (req, res) => {
    let { query, cat, location_name } = req.params;
    location_name = parseLocationName(location_name);
    if (query === 'null') query = null;
    if (cat === 'null') {
      cat = null;
    } else {
      cat = cat
        .split(',')
        .map(category => {
          switch (category) {
            case 'adult':
              return '&tag_labels=nightlife';
            case 'amusement':
              return '&tag_labels=amusementparks|shopping';
            case 'accomodation':
              return '&tag_labels=hotels';
            case 'landmark':
              return '&tag_labels=sightseeing';
            case 'nature':
              return '&tag_labels=camping|national_park|exploringnature';
            case 'sport':
              return '&tag_labels=adrenaline|sports';
            case 'food':
              return '&tag_labels=cuisine';
            case 'cultural':
              return '&tag_labels=culture|history|museums';
            default:
              return '&tag_labels=landmarks';
          }
        })
        .join('');
    }

    axios
      .get(
        `https://www.triposo.com/api/20201111/poi.json?location_id=${location_name}${
          cat ? cat : ''
        }&count=10&fields=id,name,score,images,snippet,tag_labels,coordinates,properties&order_by=-score${
          query ? `&annotate=trigram:${query}&trigram=>=0.3` : ''
        }&account=${account}&token=${token}`
      )
      .then(result => {
        Promise.all(
          result.data.results.map(result => {
            let attraction = parseAttractionObj(result);
            return addThenGetAttraction(attraction);
          })
        )
          .then(attractions => {
            const placesWithNoAddress = [];
            const placesWithAddress = [];
            attractions.forEach(attraction => {
              if (attraction.address === 'not in database') {
                placesWithNoAddress.push(attraction);
              } else {
                placesWithAddress.push(attraction);
              }
            });
            if (placesWithNoAddress.length > 0) {
              Promise.all(
                placesWithNoAddress.map(attraction => {
                  const { x, y } = attraction.location;
                  return axios.get(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${x}&lon=${y}`
                  );
                })
              )
                .then(results => {
                  const idToUpdate = [];
                  const addressToUpdate = [];
                  results.forEach((result, index) => {
                    placesWithNoAddress[index].address =
                      result.data.display_name;
                    idToUpdate.push(placesWithNoAddress[index].id);
                    addressToUpdate.push(result.data.display_name);
                  });
                  Promise.all(
                    idToUpdate.map((id, index) => {
                      addAddress(id, addressToUpdate[index]);
                    })
                  ).catch(err => console.log(err));
                  res.send([...placesWithAddress, ...placesWithNoAddress]);
                })
                .catch(err => {
                  res.send(placesWithAddress);
                  console.log('err', placesWithAddress);
                });
            } else {
              res.send(placesWithAddress);
            }
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  });

  return router;
};
