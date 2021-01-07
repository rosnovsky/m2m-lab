const Channels = require('pusher')

const appId = "1133949"
const key = "f5f180e0aef595c68091"
const secret = "5e33aeab92def79a58a2"
const cluster = "us3"

const channels = new Channels({
  appId,
  key,
  secret,
  cluster,
})

module.exports = (req, res) => {
  const data = req.body
  channels.trigger("my-channel", "test", {
  message: req.body
});
}
