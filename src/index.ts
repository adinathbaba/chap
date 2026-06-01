import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;
const waitingQueue: string[] = [];
const roomPartners =
  new Map<
    string,
    {
      user1: string;
      user2: string;
    }
  >();
  const userCodes =
  new Map<
    string,
    string
  >();

app.get("/", (req, res) => {
  res.send("Backend running");
});

io.on("connection", (socket) => {

  

  socket.on(
  "register-code",
  (code) => {

    userCodes.set(
      socket.id,
      code
    );

    console.log(
      "Code registered:",
      code
    );
  }
);
  console.log(
    "User connected:",
    socket.id


  );

  socket.on(
  "send-message",
  ({
    roomId,
    message,
  }) => {

    io.to(roomId).emit(
      "receive-message",
      message
    );
  }
);

    socket.on(
  "leave-chat",
  (
    roomId
  ) => {

    socket.leave(
      roomId
    );

    socket.to(
      roomId
    ).emit(
      "partner-left"
    );
  }
);

  socket.emit(
    "welcome",
    "Connected to GhostChat server"
  );
  socket.on(
  "join-random",
  () => {

    console.log(
      socket.id,
      "requested random chat"
    );

    if (
      waitingQueue.includes(
        socket.id
      )
    ) {
      return;
    }

    if (
      waitingQueue.length > 0
    ) {

      const partnerId =
        waitingQueue.shift();

      if (!partnerId) return;

      const roomId =
        `room_${Date.now()}`;
        roomPartners.set(
          
  roomId,
  {
    user1: socket.id,
    user2: partnerId,
  }
);

      socket.join(roomId);

      const partnerSocket =
        io.sockets.sockets.get(
          partnerId
        );

      partnerSocket?.join(
        roomId
      );

      const user1Code =
  userCodes.get(
    partnerId
  );

const user2Code =
  userCodes.get(
    socket.id
  );

io.to(
  partnerId
).emit(
  "matched",
  {
    roomId,
    partnerCode:
      user2Code,
  }
);

io.to(
  socket.id
).emit(
  "matched",
  {
    roomId,
    partnerCode:
      user1Code,
  }
);

      console.log(
        "Matched",
        socket.id,
        partnerId,
        roomId
      );

    } else {

      waitingQueue.push(
        socket.id
      );

      console.log(
        socket.id,
        "added to queue"
      );

      socket.emit(
        "waiting"
      );
    }
  }
);

  socket.on("disconnect", () => {
    const index =
  waitingQueue.indexOf(
    socket.id
  );
  for (
  const [
    roomId,
    users
  ] of roomPartners
) {
  if (
    users.user1 === socket.id ||
    users.user2 === socket.id
  ) {
    roomPartners.delete(
      roomId
    );
  }
}

if (index !== -1) {
  waitingQueue.splice(
    index,
    1
  );
}
    console.log(
      "User disconnected:",
      socket.id
    );
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `Server running on ${PORT}`
  );
});