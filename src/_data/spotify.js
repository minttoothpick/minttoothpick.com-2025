require('dotenv').config();
const fetch = globalThis.fetch;

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
} = process.env;

// Get a new access token using the refresh token
async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

// Fetch top 10 tracks from the last 30 days
async function getTopTracks() {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return data.items.map((track) => ({
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      url: track.external_urls.spotify,
      album: track.album.name,
      cover: track.album.images[0].url,
    }));
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    return [];
  }
}

module.exports = getTopTracks;
