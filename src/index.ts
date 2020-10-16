import express from "express";

// import Routes
import { migrationRouter } from "./routes/migrations";

// Middleware
const app = express();
app.use(express.json());

// Bring in Routes
app.use("/migrate", migrationRouter);

const port = process.env.PORT || 3000;
// tslint:disable-next-line: no-console
app.listen(port, () => console.log(`Server started on port ${port}...`));
