import {useState, useEffect} from 'react';
import axios from 'axios'
import './styles.css';


export default function App() {
  
  const clientID = "058ffdb2354e43729cc7cb8e921e49c3"
  const redirectURI = "http://localhost:3000/"
  const authEndpoint = "https://accounts.spotify.com/authorize"
  const responseType = "token"

  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [tracks, setTracks] = useState([])
  const [selectedTrackID, setSelectedTrackID] = useState("")
  const [trackDetails, setTrackDetails] = useState([])
  
  useEffect(() => {
    const hash = window.location.hash
    let tok = window.localStorage.getItem("token")

    if (!tok && hash) {
      tok = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      window.location.hash = ""
      window.localStorage.setItem("token", tok)
    }

    setToken(tok)
 
  }, [])

  const searchTracks = async (e) => {
    e.preventDefault()
    const {data} = await axios.get("https://api.spotify.com/v1/search/", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: searchKey,
          type: "track"
        }
    })
    setTracks(data.tracks.items)    
  }

  const tracksElements = tracks.map(track => {
    
    return (
      <button className="displayed-track" key={track.id} onClick={() => {setSelectedTrackID(track.id); getDetails(); displayData()}}> {track.name} by {track.artists[0].name}</button>
    )
  })

  const getDetails = async (e) => {
    e.preventDefault()
    const response = await axios.get(`https://api.spotify.com/v1/audio-features/${selectedTrackID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(e => {
      console.log(e)
    })
    setTrackDetails(response.data)
    
    
  }

  function displayData() {
    return (
      <div className="stats">
        <p>Energy: {trackDetails.energy}</p>
        <p>Acousticness: {trackDetails.acousticness}</p>
        <p>Liveness: {trackDetails.liveness}</p>
        <p>Danceability: {trackDetails.danceability}</p>
        <p>Speechiness: {trackDetails.speechiness}</p>
        <p>Valence: {trackDetails.valence}</p>
         <button onClick={newSong}>Find A New Vibe</button>
      </div>
    )
  }

  function newSong() {
    setSearchKey("")
    setTracks([])
    setSelectedTrackID("")
    setTrackDetails([])
  }

  function logout() {
    setToken("")
    window.localStorage.removeItem("token")
  }


  return (
    <div className="content">
      {!token ? <a href={`${authEndpoint}?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=${responseType}`}>Login to Spotify</a> : <button onClick={logout}>Log Out</button>}
      {token && <form className="searchbar" onSubmit={searchTracks}>
        <label className="searchbar-label">Search Songs:
          <input type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
          />
        </label>
        <input type="submit" value="Search Songs" />
      </form>}

      <div className="search-container"> 
        {!selectedTrackID && token && tracksElements}
      </div>
      <div >
        {(selectedTrackID && !trackDetails.energy) && <button onClick={getDetails}>Get Track Vibes</button>}
      </div>
      {trackDetails.energy && displayData()}
    </div>
  );
}

