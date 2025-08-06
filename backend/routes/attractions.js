
import axios from 'axios';
import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
const account = process.env.ACCOUNT_ID;
const token = process.env.TOKEN;

import { getAttractions } from '../utils/geocoding.js';


export default ({
  getCoordinatesByLocationName,
  addThenGetAttraction,
  addAddress,
}) => {
  router.get('/:location_name/:query/:cat', async (req, res) => {
    let { query, cat, location_name } = req.params;
    // location_name = parseLocationName(location_name);
    if (query === 'null') query = null;
    if (cat === 'null') {
      cat = 'interesting_places';
    } else {
      cat = cat
        .split(',')
        .map(category => {
          switch (category) {
            case 'adult':
              return 'adult';
            case 'amusement':
              return 'amusements';
            case 'accomodation':
              return 'accomodations';
            case 'landmark':
              return 'architecture,monuments_and_memorials, religion';
            case 'nature':
              return 'natural';
            case 'sport':
              return 'sport';
            case 'food':
              return 'foods';
            case 'cultural':
              return 'historic,cultural';
            case 'facilities':
              return 'banks,shops,transport'; 
            default:
              return 'interesting_places';
          }
        })
        .join(',');
    }


    try {
      let attractions = await getAttractions(location_name, { category: cat, query})
      attractions = await Promise.all(attractions.map(attraction => addThenGetAttraction(attraction)));
      console.log('Attractions fetched:', attractions.length);
      return attractions.length ? res.send(attractions) : res.status(404).send({ error: 'No attractions found' });
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return res.status(500).send({ error: 'Failed to fetch attractions' });
    }


  });

  return router;
};
