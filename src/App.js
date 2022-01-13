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
    
    console.log("rendered")
    
    return (
      <button className="displayed-track" key={track.id} onClick={() => setSelectedTrackID(track.id)}> {track.name} by {track.artists[0].name}</button>
    )
  })

  function logout() {
    setToken("")
    window.localStorage.removeItem("token")
  }

  return (
    <div className="App">
      {!token ? <a href={`${authEndpoint}?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=${responseType}`}>Login to Spotify</a> : "Logged in!"}
      {token && <form onSubmit={searchTracks}>
        <label>Search Songs:
          <input type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
          />
        </label>
        <input type="submit" />
      </form>}
      {token && <button onClick={logout}>Log Out</button>}
      <div className="search-container"> 
        {!selectedTrackID && token && tracksElements}
      </div>
      {selectedTrackID  && <p>{selectedTrackID}</p>}
    </div>
  );
}

