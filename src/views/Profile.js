import React, {useState, useEffect} from "react"
import { Container, Row, Col } from "reactstrap"

import Highlight from "../components/Highlight"
import Loading from "../components/Loading"
import { useAuth0 } from "../react-auth0-spa"
import Pusher from 'pusher-js'

const channels = new Pusher('f5f180e0aef595c68091', {
  cluster: 'us3',
})

// Subscribe to the appropriate channel
const channel = channels.subscribe('my-channel')

const Profile = () => {
  const { loading, user, getTokenSilently } = useAuth0()
  const [value, setValue] = useState()
  const [log, setLog] = useState([])

  // useEffect(()=> {
  //   console.log("User authenticated", user)
  // }, [])

  if (loading || !user) {
    return <Loading />
  }

  
  // Bind a callback function to an event within the subscribed channel
  channel.bind('test', function (data) {
    console.log(data.message)
  })

  // Pusher.logToConsole = true;
  async function pushData(data) {
    const res = await fetch('/api/channels-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      console.error('failed to push data')
    }
  }

  const fetchTasks = async () => {
    pushData({"Profile Page": "Now reaching to M2M API. Let's see if we are authorized..."})
    const accessToken = await getTokenSilently();
    const fetchTasksRequest = await fetch("http://localhost:3000/api/m2m", {mode: "cors", credentials: "include", headers: {
      "authorization": `Bearer ${accessToken}`}})
    const result = await fetchTasksRequest.json()
    setValue(result)
    pushData({"Profile Page": {"result from M2M API": result.result}})
    return result;
  }

  return (
    <Container className="mb-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={user.picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md>
          <h2>{user.name}</h2>
          <p className="lead text-muted">{user.email}</p>
        </Col>
      </Row>
      <Row>
        <Highlight>{JSON.stringify(value, null, 2)}</Highlight>
      </Row>
      <Row>
        <button href="#" onClick={fetchTasks}>Fetch Tasks</button>
      </Row>
      <div>{JSON.stringify(log)}</div>
    </Container>
  )
}

export default Profile
