#!/bin/sh

# Run database migrations
yarn medusa db:migrate

# Start the development server
yarn dev
