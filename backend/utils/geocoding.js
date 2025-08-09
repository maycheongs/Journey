import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
// Calculate the absolute path to the root .env file in development
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}

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
            throw new Error(`Processing error at getCoordinatesByLocationName: ${error.message}`);
        }
    }

}

const getReadableAddressByCoordinates = async (latitude, longitude) => {
    try {

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

        const response = await axios.get(url, {
            timeout: 5000,
            headers: {
                'User-Agent': 'JourneyApp/1.0 (contact@example.com)'
            }
        });

        const address_string = response.data.display_name;
        const address = address_string?.slice(address_string.indexOf(",") + 2);
        return address || 'Address not found';
    } catch (error) {
        if (error.response) {
            throw new Error(`Nominatim API error: ${error.response.status} - ${error.message}`);
        } else if (error.request) {
            throw new Error(`Network error: Unable to reach Nominatim API - ${error.message}`);
        } else {
            throw new Error(`Processing error at getReadableAddressByCoordinates: ${error.message}`);
        }
    }
};

//Attraction details for the DB: name, description, category, image, address, location, visible
const getDetailsByAttractionId = async (xId) => {
    const url = `https://api.opentripmap.com/0.1/en/places/xid/${xId}?apikey=${OTM_API_KEY}`
    try {
        

        const response = await axios.get(url, { timeout: 5000 });

        // console.log('Attraction details response:', response.data)
        let { name, wikipedia_extracts, image, address, point } = response.data;
        const readableAddress = await getReadableAddressByCoordinates(point.lat, point.lon);

        if (image && image.includes('commons.wikimedia.org')) {
            image = convertWikimediaUrl(image);
        }

        const attraction = {
            name,
            description: wikipedia_extracts?.text || 'No description available',
            image,
            address: readableAddress,
            location: `(${point.lat},${point.lon})`,
            category: 'landmark', // Default to 'interesting_places' if category is not provided
            country_code: address?.country_code?.toLowerCase() || 'unknown',
            visible: true

        }

        return attraction

    } catch (error) {
        if (error.response) {
            throw new Error(`OpenTripMap API DETAILS error: ${error.response.status} - ${error.message} url: ${url}`);
        } else if (error.request) {
            throw new Error(`Network error: Unable to reach OpenTripMap API DETAILS - ${error.message}`);
        } else {
            throw new Error(`Processing error fetching details: ${error.message}`);
        }

    }

}

// Convert a Wikimedia page URL to a direct image URL
function convertWikimediaUrl(url) {
    if (!url || !url.includes('/File:')) return url;
    const fileName = url.split('/File:')[1];
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}`;
}

// Updated getAttractionsByLocationName with country filtering
const getAttractions = async (searchString, options = {}) => {
    const { radius = 20000, category, limit = 50, rate = 1, query } = options;
    try {
        // Get coordinates and country code
        const location = await getCoordinatesByLocationName(searchString);
        const { latitude, longitude, country_code } = location;
        const searchTerm = query ? `&name=${encodeURIComponent(query)}` : '';

        // Query OpenTripMap API

        const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${longitude}&lat=${latitude}&kinds=${category}&limit=${limit}&rate=${rate}${searchTerm}&format=json&apikey=${OTM_API_KEY}`;

        const response = await axios.get(url, { timeout: 8000 });

        let attractions = response.data || []

        // Filter to 10 sorted by rate
        if (attractions.length > 10) {
            attractions.sort((a, b) => b.rate - a.rate); // Sort by rate descending
            attractions = attractions.slice(0, 10); // Limit results to the specified number
        }

        // Dynamic radius adjustment (optional)
        if (attractions.length < 5 && radius < 30000) {
            console.log(`Found only ${attractions.length} attractions, increasing radius to ${radius + 5000}`);
            return await getAttractions(searchString, { ...options, radius: radius + 5000 });
        }


        //Keep requests under the 2 req/sec limit

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const attractionDetails = [];
        for (const feature of attractions) {
            // Sleep for 500ms to avoid hitting the rate limit
            const details = await getDetailsByAttractionId(feature.xid);
            attractionDetails.push(details);
            await sleep(500);
        }

        return attractionDetails

    } catch (error) {
        if (error.response) {
            throw new Error(`OpenTripMap API error: ${error.response.status} - ${error.message}`);
        } else if (error.request) {
            throw new Error(`Network error: Unable to reach OpenTripMap API - ${error.message}`);
        } else {
            throw new Error(`Processing error at getAttractions: ${error.message}`);
        }
    }
};



const parseLocationName = async (location_name) => {
    const location = await getCoordinatesByLocationName(location_name);

    return `${location.name}, ${location.country_code}`;
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




export { getCoordinatesByLocationName, parseLocationName, getAttractions };