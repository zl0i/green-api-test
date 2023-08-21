## Quick Start

### Local

```
cd ./web
npm ci
cd ../worker
npm ci
docker-compose -f docker-compose.local.yaml up -d
```

## Test

```
curl --header "Content-Type: application/json" \
 --request POST \
 --data '{"delay":8}' \
 http://localhost:3000/jobs
```
