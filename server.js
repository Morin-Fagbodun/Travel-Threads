const express = require('express');
const {Pool} = require('pg');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '.env')});



const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());


console.log('Database configuration:');
console.log('User:', process.env.DB_USER);
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT);  

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello, World!');
});



//Users

 //get all users 
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/users/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.post('/users', async (req, res) => {
  const {name, email} = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.patch('/users/:id', async (req, res) => {
  const {id} = req.params;
  const {name, email} = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.delete('/users/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }
    res.json({message: 'User deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// Trips
//get all trips
app.get('/trips', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trips');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

//get a specific trip by id
app.get('/trips/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Trip not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.post('/trips', async (req, res) => {
  const {destination, start_date, end_date, user_id} = req.body;
  try {const result = await pool.query(
      'INSERT INTO trips (destination, start_date, end_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [destination, start_date, end_date, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } 
});

app.patch('/trips/:id', async (req, res) => {
  const {id} = req.params;
  const {destination, start_date, end_date, user_id} = req.body;
  try {
    const result = await pool.query(
      `UPDATE trips SET destination = COALESCE($1, destination), 
      start_date = COALESCE($2, start_date), 
      end_date = COALESCE($3, end_date),
      user_id = COALESCE($4, user_id) 
      WHERE id = $5 RETURNING *`,
      [destination, start_date, end_date, user_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Trip not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.delete('/trips/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM trips WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Trip not found'});
    }
    res.json({message: 'Trip deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// trip days 

app.get('/trips/days', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trip_days');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } 
});

app.post('/trips/days', async (req, res) => {
  const {trip_id, days_date} = req.body;
  try {const result = await pool.query(
      'INSERT INTO trip_days (trip_id, days_date) VALUES ($1, $2) RETURNING *',
      [trip_id, days_date]
    );
    res.status(201).json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.patch('/trips/days/:id', async (req, res) => {
  const {id} = req.params;
  const {trip_id, days_date, title, notes} = req.body;
  try {
    const result = await pool.query(
      `UPDATE trip_days SET trip_id = COALESCE($1, trip_id),
       days_date = COALESCE($2, days_date), 
       title = COALESCE($3, title), 
       notes = COALESCE($4, notes) 
       WHERE id = $5 RETURNING *`,
      [trip_id, days_date, title, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Trip day not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});     

app.delete('/trips/days/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM trip_days WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Trip day not found'});
    }
    res.json({message: 'Trip day deleted successfully'});
  }
  catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } 
});

// trip activities

app.get('/activities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/activities/:id', async (req, res) => {
  const {id} = req.params;

  try {
    const result = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Activity not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.post('/activities', async (req, res) => { 
  const {trip_day_id, activity_name, description, location, starts_at, ends_at, notes} = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO activities (trip_day_id, activity_name, description, location,starts_at, ends_at, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [trip_day_id, activity_name, description, location, starts_at, ends_at, notes]
    );
    res.status(201).json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.post('/activities/:id', async (req, res) => {
  const {id} = req.params;
  const {trip_day_id, activity_name, description, location, starts_at, ends_at, notes} = req.body;  
  try {
    const result = await pool.query(
      `UPDATE activities SET trip_day_id = COALESCE($1, trip_day_id), 
       activity_name = COALESCE($2, activity_name), 
       description = COALESCE($3, description), 
       location = COALESCE($4, location), 
       starts_at = COALESCE($5, starts_at), 
       ends_at = COALESCE($6, ends_at), 
       notes = COALESCE($7, notes) 
       WHERE id = $8 RETURNING *`,
      [trip_day_id, activity_name, description, location, starts_at, ends_at, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Activity not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});



app.delete('/activities/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Activity not found'});
    }
    res.json({message: 'Activity deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } 
});

// restaurants

app.get('/restaurants', async (req, res) => { 
  try {
    const result = await pool.query('SELECT * FROM restaurants');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/restaurants/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('SELECT * FROM restaurants WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Restaurant not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.post('/restaurants', async (req, res) => {
  const {user_id, name, address, cuisine, website,phone,notes} = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO restaurants (user_id, name, address, cuisine, website, phone, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, name, address, cuisine, website, phone, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.patch('/restaurants/:id', async (req, res) => {
  const {id} = req.params;
  const {user_id, name, address, cuisine, website, phone, notes} = req.body;  
  try {
    const result = await pool.query(
      `UPDATE restaurants SET user_id = COALESCE($1, user_id), 
      name = COALESCE($2, name), 
      address = COALESCE($3, address), 
      cuisine = COALESCE($4, cuisine), 
      website = COALESCE($5, website), 
      phone = COALESCE($6, phone), 
      notes = COALESCE($7, notes) 
      WHERE id = $8 RETURNING *`,
      [user_id, name, address, cuisine, website, phone, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Restaurant not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.delete('/restaurants/:id', async (req, res) => {
  const {id} = req.params;  
  try {
    const result = await pool.query('DELETE FROM restaurants WHERE id = $1 RETURNING *', [id]); 
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Restaurant not found'});
    }
    res.json({message: 'Restaurant deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});


//wardrobe 
app.get('/wardrobe', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wardrobe');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/wardrobe/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('SELECT * FROM wardrobe WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Wardrobe item not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.post('/wardrobe', async (req, res) => {
  const {user_id, name, category, color, season, notes} = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO wardrobe (user_id, item_name, category, color, size, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, name, category, color, season, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.patch('/wardrobe/:id', async (req, res) => {  
  const {id} = req.params;
  const {user_id, name, category, color, season, notes} = req.body;
  try {
    const result = await pool.query(
      `UPDATE wardrobe SET user_id = COALESCE($1, user_id), 
      name = COALESCE($2, name), 
      category = COALESCE($3, category), 
      color = COALESCE($4, color), 
      season = COALESCE($5, season), 
      notes = COALESCE($6, notes) 
      WHERE id = $7 RETURNING *`,
      [user_id, name, category, color, season, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Wardrobe item not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.delete('/wardrobe/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM wardrobe WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Wardrobe item not found'});
    }
    res.json({message: 'Wardrobe item deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});



//outfits

app.get('/outfits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM outfits');
    res.json(result.rows);
  } catch (err) { 
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/outfits/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('SELECT * FROM outfits WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit not found'});
    } 
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } 
});


app.post('/outfits', async (req, res) => {
  const {user_id, trip_days_id,name, notes} = req.body;
  try { const result = await pool.query(
      'INSERT INTO outfits (user_id, trip_days_id, name, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, trip_days_id,name, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.patch('/outfits/:id', async (req, res) => {
  const {id} = req.params;
  const {user_id, trip_days_id, name, notes} = req.body;
  try {
    const result = await pool.query(
      `UPDATE outfits SET user_id = COALESCE($1, user_id),
      trip_days_id = COALESCE($2, trip_days_id),
      name = COALESCE($3, name),
      notes = COALESCE($4, notes)
      WHERE id = $5 RETURNING *`,
      [user_id, trip_days_id, name, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit not found'});
    } 
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } 
});

app.delete('/outfits/:id', async (req, res) => {  
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM outfits WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit not found'});
    }
    res.json({message: 'Outfit deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

//outfit items

app.get('/outfit-items', async (req, res) => {  
  try {
    const result = await pool.query('SELECT * FROM outfit_items');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/outfit-items/:id', async (req, res) => {
  const {id} = req.params;  
  try {
    const result = await pool.query('SELECT * FROM outfit_items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit item not found'});
    } 
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }});

app.post('/outfit-items', async (req, res) => {
  const {outfit_id, wardrobe_items_id} = req.body;
  try { const result = await pool.query(
      'INSERT INTO outfit_items (outfit_id, wardrobe_items_id) VALUES ($1, $2) RETURNING *',
      [outfit_id, wardrobe_items_id]
    );
    res.status(201).json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }});



app.patch('/outfit-items/:id', async (req, res) => {
  const {id} = req.params;
  const {outfit_id, wardrobe_items_id} = req.body;
  try {
    const result = await pool.query(
      `UPDATE outfit_items SET outfit_id = COALESCE($1, outfit_id), 
      wardrobe_items_id = COALESCE($2, wardrobe_items_id)
      WHERE id = $3 RETURNING *`,
      [outfit_id, wardrobe_items_id, id]
    );  
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } });


  app.delete('/outfit-items/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM outfit_items WHERE id = $1 RETURNING *', [id]);  
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit item not found'});
    }
    res.json({message: 'Outfit item deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});


//outfit ideas 

app.get('/outfit-ideas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM outfit_ideas');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }});

  app.get('/outfit-ideas/:id', async (req, res) => {
  const {id} = req.params;  
  try {
    const result = await pool.query('SELECT * FROM outfit_ideas WHERE id = $1', [id]);  
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit idea not found'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } });


  app.post('/outfit-ideas', async (req, res) => {
  const {user_id, trip_id,title, occasion, description} = req.body;
  try { const result = await pool.query(
      'INSERT INTO outfit_ideas (user_id, trip_id, title, occasion, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, trip_id,title, occasion, description]
    );
    res.status(201).json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }});

  app.patch('/outfit-ideas/:id', async (req, res) => {
  const {id} = req.params;
  const {user_id, trip_id,title, occasion, description} = req.body;
  try {
    const result = await pool.query(
      `UPDATE outfit_ideas SET user_id = COALESCE($1, user_id),
      trip_id = COALESCE($2, trip_id),
      title = COALESCE($3, title),
      occasion = COALESCE($4, occasion),
      description = COALESCE($5, description)
      WHERE id = $6 RETURNING *`,
      [user_id, trip_id,title, occasion, description, id]
    );  
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }});

  app.delete('/outfit-ideas/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM outfit_ideas WHERE id = $1 RETURNING *', [id]);  
  if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit idea not found'});
    }
    res.json({message: 'Outfit idea deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }});


  // outfit idea items 

app.get('/outfit-idea-items', async (req, res) => {  
  try {
    const result = await pool.query('SELECT * FROM outfit_idea_items');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/outfit-idea-items/:id', async (req, res) => {
  const {id} = req.params;  
  try {
    const result = await pool.query('SELECT * FROM outfit_idea_items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit idea item not found'});
    } 
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }});

app.post('/outfit-idea-items', async (req, res) => {
  const {outfit_id, wardrobe_items_id} = req.body;
  try { const result = await pool.query(
      'INSERT INTO outfit_idea_items (outfit_idea_id, wardrobe_items_id) VALUES ($1, $2) RETURNING *',
      [outfit_idea_id, wardrobe_items_id]
    );
    res.status(201).json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }});



app.patch('/outfit-idea-items/:id', async (req, res) => {
  const {id} = req.params;
  const {outfit_id, wardrobe_items_id} = req.body;
  try {
    const result = await pool.query(
      `UPDATE outfit_idea_items SET outfit_idea_id = COALESCE($1, outfit_idea_id), 
      wardrobe_items_id = COALESCE($2, wardrobe_items_id)
      WHERE id = $3 RETURNING *`,
      [outfit_idea_id, wardrobe_items_id, id]
    );  
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  } });


  app.delete('/outfit-idea-items/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM outfit_idea_items WHERE id = $1 RETURNING *', [id]);  
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Outfit item not found'});
    }
    res.json({message: 'Outfit idea item deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});



// prefrences 

//fill out later.. too tired 
















app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
