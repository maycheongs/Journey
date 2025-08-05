import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
// Calculate the absolute path to the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
// Import the API key FOR opentripmap from env.
const OTM_API_KEY = process.env.OTM_API_KEY;


/*
Uses Open-Meteo's geocoding API to get coordinates by location name
https://open-meteo.com/en/docs/geocoding-api

API response e.g.
{
    "results": [
        {
            "id": 2950159,
            "name": "Berlin",
            "latitude": 52.52437,
            "longitude": 13.41053,
            "country_code": "DE",
            "country": "Deutschland",
            "admin1": "Berlin", <--- admin1 to 4 refer to secondary divisions e.g. state or province
            "admin2": "",
            "admin3": "Berlin, Stadt",
            "admin4": "Berlin",
            ...
        },
        {
        ...
        }
    ]
}
*/

const getCoordinatesByLocationName = async (searchString) => {

    //Parse search string to return the best match, e.g. if there are multiple results and the search string has commas to specify state or county
    const parts = searchString.split(',').map(part => part.trim().toLowerCase()).filter(part => part.length > 0);

    if (!parts.length) throw new Error('Invalid search string');

    const placeName = parts[0];
    const adminTerms = parts.slice(1)

    // Query Open-Meteo's geocoding API
    try {
        const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=10&language=en&format=json`,
            { timeout: 5000 });
        let matches = response.data.results;
        if (!matches || !matches.length) {
            throw new Error(`No results found for "${searchString}"`);
        }
        // Filter matches based on admin terms
        const bestMatch = findBestMatch(matches, adminTerms);

        if (!bestMatch) throw new Error(`No valid match found after filtering`);

        return {
            latitude: bestMatch.latitude,
            longitude: bestMatch.longitude,
            name: bestMatch.name,
            country: bestMatch.country,
            country_code: bestMatch.country_code,
            admin1: bestMatch.admin1
        }
    }

    catch (error) {

        if (error.response) {
            throw new Error(`API  error: ${error.response.status} - ${error.message}`)
        } else if (error.request) {
            throw new Error(`Network error: Unable to reach the API - ${error.message}`);
        } else {
            throw new Error(`Processing error: ${error.message}`);
        }
    }

}

//Finds the best match if the response has multiple results, and there are admin terms provided e.g. state or county as in Paris, Texas.
const findBestMatch = (matches, adminTerms) => {

    // If admin terms are provided, filter results to find the best match, else return the first match
    if (!adminTerms.length || matches.length === 1) return matches[0];

    for (const term of adminTerms) {
        const filtered = matches.filter(result =>
            [result.admin1?.toLowerCase(),
            result.admin2?.toLowerCase(),
            result.country?.toLowerCase(),
            result.country_code?.toLowerCase()]
                .some(field => field && field.includes(term))
        );
        if (filtered.length === 1) return filtered[0]; //Keep filtering only if there are still multiple matches
        if (filtered.length > 1) matches = filtered;
    }

    return matches[0];
}

// // Updated getAttractionsByLocationName with country filtering
// const getAttractionsByLocationName = async (searchString, options = {}) => {
//   const { radius = 15000, kinds = 'attractions', limit = 50, rate = 2 } = options;
//   try {
//     // Get coordinates and country code
//     const location = await getCoordinatesByLocationName(searchString);
//     const { latitude, longitude, country_code } = location;

//     // Query OpenTripMap API
//     const apiKey = process.env.OPENTRIPMAP_API_KEY;
//     if (!apiKey) throw new Error('OpenTripMap API key not configured');

//     const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${longitude}&lat=${latitude}&kinds=${kinds}&limit=${limit}&rate=${rate}&format=json&apikey=${apiKey}`;
//     const response = await axios.get(url, { timeout: 5000 });
//     let attractions = response.data.features || [];

//     // Filter by country_code if provided
//     if (country_code) {
//       attractions = attractions.filter(feature => 
//         feature.properties.country_code?.toUpperCase() === country_code.toUpperCase()
//       );
//     }

//     // Dynamic radius adjustment (optional)
//     if (attractions.length < 10 && radius < 30000) {
//       return getAttractionsByLocationName(searchString, { ...options, radius: radius + 5000 });
//     }

//     return {
//       city: location.name,
//       latitude,
//       longitude,
//       country_code,
//       attractions: attractions.map(feature => ({
//         name: feature.properties.name || 'Unnamed Attraction',
//         xid: feature.properties.xid,
//         kinds: feature.properties.kinds.split(','),
//         rate: feature.properties.rate || 'N/A',
//         coordinates: {
//           latitude: feature.geometry.coordinates[1],
//           longitude: feature.geometry.coordinates[0]
//         },
//         distance: Math.sqrt(
//           Math.pow(feature.geometry.coordinates[1] - latitude, 2) +
//           Math.pow(feature.geometry.coordinates[0] - longitude, 2)
//         ) * 111139 // Approx. meters
//       }))
//     };
//   } catch (error) {
//     if (error.response) {
//       throw new Error(`OpenTripMap API error: ${error.response.status} - ${error.message}`);
//     } else if (error.request) {
//       throw new Error(`Network error: Unable to reach OpenTripMap API - ${error.message}`);
//     } else {
//       throw new Error(`Processing error: ${error.message}`);
//     }
//   }
// };