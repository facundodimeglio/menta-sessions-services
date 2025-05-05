const { v4: uuidv4 } = require("uuid");

const createJitsiMeeting = () => {
  const roomName = `menta-${uuidv4()}`;
  const meetingUrl = `https://meet.jit.si/${roomName}`;
  return { meetingUrl, roomName };
};

module.exports = { createJitsiMeeting };