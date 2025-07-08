import { Container } from "@cloudflare/containers";

export class SimpleContainer extends Container {
  // The port the container is listening on
  defaultPort = 8080;
  // Stop the instance if no requests are sent for 10 minutes
  sleepAfter = "10m";
}
