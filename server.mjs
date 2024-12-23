import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000; // Use environment variable for port or default to 5000

// Enable CORS for all origins
app.use(cors());

// Middleware to parse incoming JSON
app.use(express.json());

app.post('/get-ipo-data', async (req, res) => {
  try {
    // Make a request to the IPO API or process data
    const response = await axios.post('https://app.ipodekho.com/GetMainLineIpo', {
      // Add any necessary request payload here
    });

    // Send the API response back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.post('/get-ipo-data/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    console.log(`Fetching IPO data for slug: ${slug}`);
    const response = await axios.post(`https://app.ipodekho.com/GetSlugByMainLineIpo/${slug}`);
    console.log('Received data:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching IPO data:', error.message);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});