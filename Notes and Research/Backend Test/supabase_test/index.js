//Requirements
const express = require('express');
const cors = require('cors'); 
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 5000;

//Create Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

//Middleware to enable CORS
app.use(cors()); 
app.use(express.json());

//Get all users
app.get('/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

//Get all events
app.get('/events', async (req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

//Add new user
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert({username: username, email: email, password: password}); 
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ data });
});

//Login user
app.post('/login', async (req, res) => {
  const{ email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('password , id')
    .eq('email', email);
  if (error) return res.status(500).json({ error: error.message });
  const id = data[0]?.id
  if( data[0]?.password == password){
    return res.status(201).json({ id });
  }
  else{
    return res.status(401).json({ error: 'Unauthorized' });
  }
})

// Add Event 
app.post('/events', async (req, res) => {

  const {event_name, start_time, end_time, event_date, calendar_source} = req.body; 
  try {
    const {data, error } = await supabase
    .from('events')
    .insert([
      { event_name,
      start_time,
      end_time, 
      event_date, 
      calendar_source}
  ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: error.message }); 
  }

  return res.status(201).json({ data }); 
} catch (error) {
  console.error('Unexpected error:', error); 
  return res.status(500).json({ error: 'Unexpected server error'})
}
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});