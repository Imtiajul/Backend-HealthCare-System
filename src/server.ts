import app from "./app";
import { envVars } from "./app/config/env";


const bootstrap = () => {
    try {
        // Start the server
        app.listen(envVars.PORT, () => {
            console.log("Server is running on https://localhost:", envVars.PORT);
        })
    } catch (error) {
        console.error("Start Server Error:", error);
    }
}

bootstrap();
