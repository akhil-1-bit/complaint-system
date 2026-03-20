const axios = require('axios');
require('dotenv').config();

class MapService {
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  static async findNearestDeptFromDB(userLat, userLon, categoryName) {
    const db = require('../config/db');
    try {
      // Find all offices for this category (e.g., 'Police')
      const [depts] = await db.execute(
        'SELECT id, name, location, latitude, longitude FROM departments WHERE name = ?',
        [categoryName]
      );

      let nearest = null;
      let minDistance = Infinity;

      depts.forEach(dept => {
        if (dept.latitude && dept.longitude) {
          const dist = this.calculateDistance(userLat, userLon, dept.latitude, dept.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            // Map 'location' to 'name' for consistent nearest object structure
            nearest = { id: dept.id, name: dept.location, lat: dept.latitude, lon: dept.longitude, distance: dist.toFixed(2) };
          }
        }
      });

      return nearest;
    } catch (error) {
      console.error("DB Proximity Error:", error);
      return null;
    }
  }

  static async findNearestAuthority(lat, lon, department) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      return null; 
    }

    const typeMapping = {
      'Police': 'police',
      'Medical': 'hospital',
      'Fire': 'fire_station',
      'Municipal': 'city_hall'
    };

    const type = typeMapping[department] || 'establishment';

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=${type}&key=${apiKey}`
      );

      if (response.data.results && response.data.results.length > 0) {
        const place = response.data.results[0];
        return {
          name: place.name,
          address: place.vicinity,
          lat: place.geometry.location.lat,
          lon: place.geometry.location.lng
        };
      }
      return null;
    } catch (error) {
      console.error("Maps API Error:", error);
      return null;
    }
  }

  static getNavigationLink(destLat, destLon) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}`;
  }
}

module.exports = MapService;
