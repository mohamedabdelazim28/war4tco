require('dotenv').config();

const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '',
      EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim() ?? '',
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL?.trim() ?? '',
    },
  },
};
