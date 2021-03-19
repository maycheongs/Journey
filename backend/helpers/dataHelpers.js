// if need to reformat output of queries for easier manipulation on front end
// do that in here

const itineraryObj = (resultArr) => {
  const {
    id,
    name,
    description,
    image,
    trip_type,
    visible,
    creator_id,
    start_date,
    end_date,
  } = resultArr[0];

  const itinerary = {
    id,
    name,
    description,
    image,
    trip_type,
    visible,
    creator_id,
    start_date,
    end_date,
    locations: [],
  };
  if (resultArr[0].location_id) {
    const dayObjs = [];
    resultArr.forEach((item) => {
      if (!dayObjs.some((day) => day.id === item.day_id)) {
        dayObjs.push({
          id: item.day_id,
          location_id: item.location_id,
          location_name: item.location_name,
          day_order: item.day_order,
          activities: [],
        });
      }

      let activityDay = dayObjs.find((day) => day.id === item.day_id);
      if (item.activity_id) {
        activityDay.activities.push({
          id: item.activity_id,
          start_time: item.activity_start_time,
          end_time: item.activity_end_time,
          notes: item.activity_notes,
          name: item.attraction_name,
          image: item.attraction_image,
          address: item.attraction_address,
          location: item.attraction_location,
          description: item.attraction_description,
          category: item.attraction_category,
        });
      }
    });
    const locationArr = [];
    dayObjs.forEach((day) => {
      if (
        !locationArr.slice(-1)[0] ||
        !(locationArr.slice(-1)[0].id === day.location_id)
      ) {
        locationArr.push({
          id: day.location_id,
          name: day.location_name,
          days: [],
        });
      }
      locationArr.slice(-1)[0].days.push({
        id: day.id,
        day_order: day.day_order,
        activities: day.activities,
      });
    });

    itinerary.locations = [...locationArr];
  }

  return itinerary;
};
const parseTravelParty = (party) => {
  return party.map((user) => ({
    id: user.user_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  }));
};

const parseAttractionObj = (attractionObj) => {
  const tag_labels = attractionObj.tag_labels;
  let category = 'landmark';
  if (tag_labels.includes('sightseeing') || tag_labels.includes('architecture'))
    category = 'landmark';
  if (tag_labels.includes('cuisine')) category = 'food';
  if (tag_labels.includes('museums') || tag_labels.includes('poitype-Church'))
    category = 'cultural';
  if (tag_labels.includes('adrenaline')) category = 'sport';
  if (tag_labels.includes('amusementparks') || tag_labels.includes('zoos'))
    category = 'amusement';
  if (tag_labels.includes('hotels')) category = 'accomodation';
  if (tag_labels.includes('nightlife')) category = 'adult';
  if (
    tag_labels.includes('camping') ||
    tag_labels.includes('national_park') ||
    tag_labels.includes('exploringnature')
  )
    category = 'nature';

  let address = attractionObj.properties.find((el) => el.key === 'address');
  address = (address && address.value) || 'not in database';
  const image =
    (attractionObj.images[0] && attractionObj.images[0].source_url) || null;
  const attraction = {
    name: attractionObj.name,
    description: attractionObj.snippet,
    category: category,
    image: image,
    address: address,
    location: `${attractionObj.coordinates.latitude},${attractionObj.coordinates.longitude}`,
  };

  return attraction;
};

module.exports = { itineraryObj, parseTravelParty, parseAttractionObj };

