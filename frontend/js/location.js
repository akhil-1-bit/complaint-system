const LocationService = {
  coords: null,

  async getCurrentLocation(highAccuracy = true) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({ code: 'NOT_SUPPORTED', message: 'Geolocation is not supported by your browser' });
        return;
      }

      const options = { 
        enableHighAccuracy: highAccuracy, 
        timeout: 15000,
        maximumAge: 0 
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          console.log("Success: Real location detected", this.coords);
          resolve(this.coords);
        },
        (error) => {
          let errorMsg = "Location access failed";
          let code = 'UNKNOWN';

          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "User denied location access";
              code = 'PERMISSION_DENIED';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Location information is unavailable";
              code = 'POSITION_UNAVAILABLE';
              break;
            case error.TIMEOUT:
              errorMsg = "Location request timed out";
              code = 'TIMEOUT';
              break;
          }
          
          console.error(`Location Error (${code}):`, errorMsg);
          reject({ code, message: errorMsg });
        },
        options
      );
    });
  }
};
