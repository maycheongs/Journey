import { parseLocationName } from "../utils/geocoding.js";

export default db => {
  const getAllItineraries = () => {
    const query = {
      text: `SELECT itineraries.*, COUNT(DISTINCT days.id) AS days FROM itineraries
      LEFT JOIN days ON itineraries.id = days.itinerary_id
      LEFT JOIN bookmarks ON itineraries.id = bookmarks.itinerary_id
      WHERE visible = true
      GROUP BY itineraries.id
      ORDER BY COUNT(bookmarks.itinerary_id) DESC
      LIMIT 25;`,
    };

    return db
      .query(query)
      .then(result => result.rows)
      .catch(err => err);
  };

  const createNewItinerary = itinerary => {
    const query = {
      text: `INSERT INTO itineraries (name, description, image, trip_type, creator_id, start_date, visible) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
      values: [
        itinerary.name,
        itinerary.description,
        itinerary.image,
        itinerary.tripType,
        itinerary.userId,
        itinerary.startDate,
        itinerary.visible,
      ],
    };

    return db
      .query(query)
      .then(result => result.rows[0])
      .catch(err => err);
  };

  const createTravelParty = (itineraryId, userId) => {
    const query = {
      text: `INSERT INTO travel_parties (itinerary_id, user_id)
      VALUES($1, $2) RETURNING *;`,
      values: [itineraryId, userId],
    };

    return db
      .query(query)
      .then(result => result.rows[0])
      .catch(err => err);
  };

  const getTravelParty = itineraryId => {
    const query = {
      text: `select * from travel_parties 
      JOIN users ON user_id = users.id
      WHERE itinerary_id = $1;`,
      values: [itineraryId],
    };

    return db
      .query(query)
      .then(result => result.rows)
      .catch(err => err);
  };

  const deleteCollaborator = (itineraryId, userId) => {
    const query = {
      text: `delete from travel_parties
      WHERE itinerary_id = $1 AND user_id = $2
      RETURNING *;`,
      values: [itineraryId, userId],
    };

    return db
      .query(query)
      .then(result => result.rows)
      .catch(err => err);
  };

  const addCollaborator = (itineraryId, userEmail) => {
    const query = {
      text: `INSERT INTO travel_parties (itinerary_id,user_id)
      VALUES ($1, (SELECT id from users WHERE email= $2))
      RETURNING *`,
      values: [itineraryId, `${userEmail}`],
    };
    return db
      .query(query)
      .then(result => result.rows[0])
      .catch(err => err);
  };

  const getDetailedItinerary = itineraryId => {
    const query = {
      text: `select
      itineraries.* ,
      days.id as day_id,
      days.day_order as day_order,
      locations.name as location_name,
      locations.id as location_id,
      activities.id as activity_id,
      activities.start_time as activity_start_time,
      activities.end_time as activity_end_time,
      activities.notes as activity_notes,
      attractions.name as attraction_name,
      attractions.image as attraction_image,
      attractions.address as attraction_address,
      attractions.location as attraction_location,
      attractions.visible as attraction_visibility,
      attractions.category as attraction_category,
      attractions.description as attraction_description

      from itineraries 
      LEFT JOIN days ON itineraries.id = itinerary_id 
      LEFT JOIN locations ON location_id = locations.id
      LEFT JOIN activities ON days.id = day_id
      LEFT JOIN attractions on attractions.id = attraction_id      
      WHERE itineraries.id = $1 
      GROUP BY itineraries.id, days.id, locations.id,activities.id,attractions.id
      ORDER BY days.day_order;`,
      values: [itineraryId],
    };
    return db
      .query(query)
      .then(result => result.rows)
      .catch(err => err);
  };

  const getMyLocations = itineraryId => {
    const query = {
      text: `select activities.id as activity_id, attractions.* from activities
      JOIN attractions ON attractions.id = attraction_id
      WHERE itinerary_id = $1 
      AND day_id is null;`,
      values: [itineraryId],
    };
    return db
      .query(query)
      .then(result => result.rows)
      .catch(err => err);
  };

  const createAttraction = attraction => {
    const query = {
      text: `INSERT INTO attractions (name, description, category, image, address, location)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      values: [
        attraction.name,
        attraction.description,
        attraction.category,
        attraction.image,
        attraction.address,
        attraction.location,
      ],
    };

    return db
      .query(query)
      .then(result => result.rows[0])
      .catch(err => err);
  };

  const createActivity = activity => {
    const query = {
      text: `INSERT INTO activities (day_id, start_time, end_time, attraction_id, itinerary_id)
      VALUES($1, $2, $3, $4, $5) RETURNING *;`,
      values: [
        activity.dayId,
        activity.start,
        activity.end,
        activity.attractionId,
        activity.itineraryId,
      ],
    };

    return db
      .query(query)
      .then(result => result.rows[0])
      .catch(err => err);
  };

  // const convertLocationLetters = locationName => {
  //   switch (locationName) {
  //     case 'Malmo':
  //       return 'Malmö';
  //     case 'Zurich':
  //       return 'Zürich';
  //     case 'Dusseldorf':
  //       return 'Düsseldorf';
  //     case 'Fussen':
  //       return 'Füssen';
  //     case 'Lubeck':
  //       return 'Lübeck';
  //     case 'Wurzberg':
  //       return 'Würzburg';
  //     case 'Cancun':
  //       return 'Cancún';
  //     case 'Pecs':
  //       return 'Pécs';
  //     case 'Malaga':
  //       return 'Málaga';
  //     case 'Sao Paulo':
  //       return 'São Paulo';
  //     default:
  //       return locationName;
  //   }
  // };

  const addDayWithLocation = async (itineraryId, locationName) => {

    const parsedName = await parseLocationName(locationName)
    const query = {
      text: `
    WITH existing AS (
      SELECT id 
      FROM locations 
      WHERE name = $2 OR name ILIKE $2
      LIMIT 1
    ),
    inserted AS (
      INSERT INTO locations (name)
      SELECT $2
      WHERE NOT EXISTS (SELECT 1 FROM existing)
      RETURNING id
    ),
    loc AS (
      SELECT id FROM existing
      UNION ALL
      SELECT id FROM inserted
    ),
    next_order AS (
      SELECT COALESCE(MAX(day_order), 0) + 1 AS day_order
      FROM days
      WHERE itinerary_id = $1
    )
    INSERT INTO days (itinerary_id, location_id, day_order)
    SELECT 
      $1, 
      (SELECT id FROM loc LIMIT 1), 
      (SELECT day_order FROM next_order)
    RETURNING *;
  `,
      values: [itineraryId, parsedName],
    };
    try {
      const result = await db.query(query);
      if (result.rows.length === 0) {
        console.warn('No row returned from INSERT. Check if $2 is valid:', parsedName);
        return null;
      }

      return result.rows[0];

    } catch (err) {
      throw new Error (`Database Error: Error encountered while adding location ${locationName} into a new day for itinerary ${itineraryId} `, err)
    }
  };
  const getItinerary = itineraryId => {
    const query = {
      text: `SELECT * FROM itineraries WHERE id = $1;`,
      values: [itineraryId],
    };

    return db
      .query(query)
      .then(result => result.rows[0])
      .catch(err => err);
  };

  const deleteItinerary = itineraryId => {
    const query = {
      text: `DELETE FROM itineraries WHERE id = $1 RETURNING *;`,
      values: [itineraryId],
    };

    return db
      .query(query)
      .then(result => result.rows[0])
      .catch(err => err);
  };

  const getItinerariesForGroup = id => {
    const query = {
      text: `SELECT itineraries.*, COUNT(days.id) AS days FROM itineraries
      LEFT JOIN travel_parties ON itineraries.id = travel_parties.itinerary_id
      LEFT JOIN days ON itineraries.id = days.itinerary_id 
      WHERE user_id = $1
      GROUP BY itineraries.id`,
      values: [id],
    };

    return db
      .query(query)
      .then(result => result.rows)
      .catch(err => err);
  };

  const reorderDays = (daysIdArr, daysOrderArr) => {
    const whenStrings = `${daysIdArr
      .map((dayId, index) => {
        return `WHEN id = ${dayId} THEN ${daysOrderArr[index]}`;
      })
      .join(' ')}`;

    const whereString = `${daysIdArr.join(',')}`;
    const query = {
      text: `UPDATE days SET day_order = case
      ${whenStrings}
      END      
      WHERE id IN (${whereString})`,
    };
    return db
      .query(query)
      .then(result => result.rows)
      .catch(err => err);
  };

  const deleteDayFromItinerary = day_id => {
    const query = {
      text: `DELETE from days WHERE id = $1 RETURNING *`,
      values: [day_id],
    };
    return db
      .query(query)
      .then(result => result.rows)
      .catch(err => err);
  };

  const deleteActivity = activityId => {
    const query = {
      text: `DELETE FROM activities WHERE id = $1 RETURNING *;`,
      values: [activityId],
    };

    return db
      .query(query)
      .then(res => res.rows[0])
      .catch(err => err);
  };

  const updateActivity = (
    start_time,
    end_time,
    notes,
    activity_id,
    dayOrder,
    itinerary_id
  ) => {
    if (start_time && start_time.length < 8) {
      start_time += ':00';
    }
    if (end_time && start_time.length < 8) {
      end_time += ':00';
    }
    if (!notes) {
      notes = '';
    }

    let text = `UPDATE activities SET 
    start_time = $1,
    end_time = $2,
    notes = $3,
    day_id = (SELECT id FROM days WHERE itinerary_id = $5 AND day_order = $6) 
    WHERE id = $4
    RETURNING *`;

    let values = [
      start_time,
      end_time,
      notes,
      activity_id,
      itinerary_id,
      dayOrder,
    ];

    if (dayOrder === null) {
      text = `UPDATE activities SET
      start_time = $1,
      end_time = $2,
      notes = $3,
      day_id = $5
      WHERE id = $4
      RETURNING *;`;
      values = [start_time, end_time, notes, activity_id, dayOrder];
    }

    const query = {
      text: text,
      values: values,
    };
    return db
      .query(query)
      .then(res => res.rows[0])
      .catch(err => err);
  };

  const editItinerary = itinerary => {
    const query = {
      text: `UPDATE itineraries
      SET name = $1, description = $2, image = $3, trip_type = $4, start_date = $5, visible = $7
      WHERE id = $6
      RETURNING *;`,
      values: [
        itinerary.name,
        itinerary.description,
        itinerary.image,
        itinerary.tripType,
        itinerary.startDate,
        itinerary.id,
        itinerary.visible,
      ],
    };

    return db
      .query(query)
      .then(res => res.rows[0])
      .catch(err => err);
  };

  const createActivityWithoutDay = (attractionId, itineraryId) => {
    const query = {
      text: `INSERT INTO activities (attraction_id, itinerary_id)
      VALUES ($1, $2) RETURNING *;`,
      values: [attractionId, itineraryId],
    };

    return db
      .query(query)
      .then(res => res.rows[0])
      .catch(err => err);
  };

  const editActivityDay = (activityId, dayId) => {
    const query = {
      text: `UPDATE activities
      SET day_id = $1
      WHERE id = $2
      RETURNING *;`,
      values: [dayId, activityId],
    };

    return db
      .query(query)
      .then(res => res.rows[0])
      .catch(err => err);
  };

  const getQueryItineraries = (searchTerms, types, length) => {
    let values = [];
    const searchQuery = `%${searchTerms.trim()}%`;

    const tripTypes = types
      .toLowerCase()
      .split(',')
      .map(type => {
        return `'${type}'`;
      });
    const tripString = `${tripTypes.join(',')}`;

    let baseQuery = `SELECT itineraries.id FROM itineraries
    LEFT JOIN days ON itineraries.id = days.itinerary_id
    LEFT JOIN bookmarks ON itineraries.id = bookmarks.itinerary_id
    LEFT JOIN locations ON days.location_id = locations.id `;

    const baseQueryEnd = `GROUP BY itineraries.id
    ORDER BY COUNT(bookmarks.itinerary_id) DESC`;

    if (searchTerms === 'null') {
      if (types === 'null') {
        baseQuery += `GROUP BY itineraries.id HAVING COUNT(DISTINCT days.id) = $1 ORDER BY COUNT(bookmarks.itinerary_id) DESC`;
        values = [length];
      } else if (length === 'null') {
        baseQuery += `WHERE itineraries.trip_type IN (${tripString}) `;
        baseQuery += baseQueryEnd;
      } else {
        baseQuery += `WHERE itineraries.trip_type IN (${tripString}) GROUP BY itineraries.id HAVING COUNT(DISTINCT days.id) = $1 ORDER BY COUNT(bookmarks.itinerary_id) DESC`;
        values = [length];
      }
    }

    if (searchTerms !== 'null') {
      if (types === 'null' && length === 'null') {
        baseQuery += `WHERE itineraries.description iLIKE $1 OR itineraries.name iLIKE $1 OR locations.name iLIKE $1 `;
        baseQuery += baseQueryEnd;
        values = [searchQuery];
      } else if (types === 'null') {
        baseQuery += `WHERE itineraries.description iLIKE $1 OR itineraries.name iLIKE $1 OR locations.name iLIKE $1 GROUP BY itineraries.id HAVING COUNT(DISTINCT days.id) = $2 ORDER BY COUNT(bookmarks.itinerary_id) DESC`;
        values = [searchQuery, length];
      } else if (length === 'null') {
        baseQuery += `WHERE (itineraries.description iLIKE $1 OR itineraries.name iLIKE $1 OR locations.name iLIKE $1) AND itineraries.trip_type IN (${tripString}) `;
        baseQuery += baseQueryEnd;
        values = [searchQuery];
      } else {
        baseQuery += `WHERE (itineraries.description iLIKE $1 OR itineraries.name iLIKE $1 OR locations.name iLIKE $1) AND itineraries.trip_type IN (${tripString}) GROUP BY itineraries.id HAVING COUNT(DISTINCT days.id) = $2 ORDER BY COUNT(bookmarks.itinerary_id) DESC`;
        values = [searchQuery, length];
      }
    }

    let finalQuery = `SELECT itineraries.*, COUNT(DISTINCT days.id) AS days FROM itineraries
    LEFT JOIN days ON itineraries.id = days.itinerary_id
    LEFT JOIN bookmarks ON itineraries.id = bookmarks.itinerary_id
    WHERE itineraries.id IN (${baseQuery}) AND itineraries.visible = true
    GROUP BY itineraries.id
    ORDER BY COUNT(bookmarks.itinerary_id) DESC
    LIMIT 25;`;

    const query = {
      text: finalQuery,
      values: values,
    };

    return db
      .query(query)
      .then(res => res.rows)
      .catch(err => err);
  };

  const getTripNotes = itinerary_id => {
    const query = {
      text: `SELECT * from trip_notes
      WHERE itinerary_id = $1`,
      values: [itinerary_id],
    };
    return db
      .query(query)
      .then(res => res.rows)
      .catch(err => err);
  };

  const editTripNote = (noteId, note, important) => {
    const query = {
      text: `UPDATE trip_notes 
      SET note = $2,
      important = $3
      WHERE id = $1
      RETURNING *
      `,
      values: [noteId, note, important],
    };
    return db
      .query(query)
      .then(res => res.rows[0])
      .catch(err => err);
  };

  const addTripNote = (itinerary_id, note, important) => {
    const query = {
      text: `INSERT INTO trip_notes (itinerary_id,note, important)
      VALUES ($1,$2,$3)
      RETURNING *;`,
      values: [itinerary_id, note, important],
    };
    return db
      .query(query)
      .then(res => res.rows[0])
      .catch(err => err);
  };
  const deleteTripNote = note_id => {
    const query = {
      text: `DELETE from trip_notes
      WHERE id = $1 RETURNING*`,
      values: [note_id],
    };
    return db
      .query(query)
      .then(res => res.rows[0])
      .catch(err => err);
  };

  return {
    getAllItineraries,
    createNewItinerary,
    createTravelParty,
    getDetailedItinerary,
    getTravelParty,
    deleteCollaborator,
    createAttraction,
    addCollaborator,
    createActivity,
    addDayWithLocation,
    getItinerary,
    deleteItinerary,
    getItinerariesForGroup,
    deleteDayFromItinerary,
    reorderDays,
    deleteActivity,
    updateActivity,
    editItinerary,
    getMyLocations,
    createActivityWithoutDay,
    editActivityDay,
    getQueryItineraries,
    getTripNotes,
    editTripNote,
    addTripNote,
    deleteTripNote,
  };
};
