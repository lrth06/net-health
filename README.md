# net-health

## Introduction

This project is a simple rotating logger of network health metrics. It logs the following metrics:

- [download speed](https://en.wikipedia.org/wiki/Download_speed)
- [upload speed](https://en.wikipedia.org/wiki/Upload_speed)
- [latency](https://en.wikipedia.org/wiki/Latency)

This data gathered by a node server, and stored in a [mongodb](https://mongodb.org) instance. The data is then sent by [socket.io](https://github.com/socketio/socket.io) to a [React](https://reactjs.org/) client on a 5 minute interval, sending the last 24 hours' worth of data.

Within the client, the [react-chartjs-2](https://github.com/jerairrest/react-chartjs-2) library is used to render the data.

## Usage

###All use cases:

```bash
git clone https://github.com/lrth06/net-health.git
cd net-health
```

<!--
### To run without Docker:

**Note:** You **MUST** have a mongodb instance running locally to use without docker.

```bash
npm install
npm start
```

in a new terminal window:

```bash
cd client
npm install
npm start
``` -->

### To run with Docker (recommended):

```bash
# To start
docker-compose up -d
# To stop without unmounting volumes
docker-compose down
# To stop and unmount volumes
docker-compose down -v
```

---

> This project was built with the assistance of [github copilot](https://copilot.github.com/).
