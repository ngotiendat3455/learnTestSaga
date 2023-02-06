// src/mocks/handlers.js
import { rest } from 'msw'
import { shows, bands } from "../test-utils/fake-data";

import { baseUrl, endpoints } from "../app/axios/constants";
import { bandUrl } from "../features/band/redux/bandApi";
import { showsUrl } from "../features/tickets/redux/showApi";

export const handlers = [
  rest.get(showsUrl, (req, res, ctx) => {
    return res(ctx.json({ shows }));
  }),
  rest.get(`${showsUrl}/:showId`, (req, res, ctx) => {
    const { showId } = req.params;
    // showId is conveniently its index in the array
    return res(ctx.json({ show: shows[showId] }));
  }),
  rest.get(`${bandUrl}/:bandId`, (req, res, ctx) => {
    const { bandId } = req.params;
    // bandId is conveniently its index in the array
    return res(ctx.json({ band: bands[bandId] }));
  }),
];
