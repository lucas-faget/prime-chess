/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from "@adonisjs/core/services/router";
import transmit from "@adonisjs/transmit/services/main";

transmit.registerRoutes();
const GamesController = () => import("#controllers/games_controller");

router.post("/games/create", [GamesController, "create"]);
router.post("/games/:id/join", [GamesController, "join"]);
router.post("/games/:id/move", [GamesController, "move"]);
