import express from 'express';
import hospitalsData from '../data/hospitals.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { city, department } = req.query;

  let filtered = [...hospitalsData];

  // Filter by city
  if (city) {
    filtered = filtered.filter((h) => h.city.toLowerCase() === city.toLowerCase());
  }

  // Filter by department
  if (department) {
    filtered = filtered.filter((h) =>
      h.departments.some((d) => d.toLowerCase() === department.toLowerCase())
    );
  }

  res.json({ hospitals: filtered });
});

export default router;
