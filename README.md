Simple app to explore NHS medicines usage data for hospitals. 

_Dataset last updated 2024-07-08_

#### Visit [hospitalmedicines.genomium.org](//hospitalmedicines.genomium.org)

Data source: [NHSBSA](https://opendata.nhsbsa.net/dataset/secondary-care-medicines-data-indicative-price/), available under Open Government License. 



### Code

This repo contains code for a Next app which interacts with a Postgres DB. Code to populate the Postgres DB is in `PopulateDB.ipynb`.


## Instructions for running

### Development

```
yarn install
yarn dev
```


### Production

```
yarn install
yarn build
yarn start
```

Or, as we do, host the app with Vercel.


## Background

See https://openprescribing.net/hospitals (but this project has no affiliation with them) for background on this data.

