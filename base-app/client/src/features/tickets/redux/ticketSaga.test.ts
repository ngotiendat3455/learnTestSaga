import { expectSaga } from "redux-saga-test-plan";
import { holdReservation, purchasePayload, purchaseReservation } from "../../../test-utils/fake-data";
import * as matchers from "redux-saga-test-plan/matchers";
import { TicketAction, TransactionStatus } from "../types";
import { cancelTransaction, generateErrorToastOptions, purchaseTickets, ticketFlow } from "./ticketSaga";
import { cancelPurchaseServerCall, releaseServerCall, reserveTicketServerCall } from "../api";
import { endTransaction, resetTransaction, selectors, startTicketAbort, startTicketPurchase, startTicketRelease } from "./ticketSlice";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";
import { showToast } from "../../toast/redux/toastSlice";
import {
  HoldReservation,
} from "../../../../../shared/types";
import axios from "axios";
import { take, call, race, cancel } from "redux-saga/effects";
const holdAction = {
  type: "test",
  payload: holdReservation,
};

const payloadPerchase = {
  purchaseReservation: holdReservation,
  holdReservation: {
    type: TicketAction.hold
  },
}
const networkProviders: Array<StaticProvider>= [
  [matchers.call.fn(reserveTicketServerCall), null],
  [matchers.call.fn(releaseServerCall), null],
  [matchers.call.fn(cancelPurchaseServerCall), null],
];

test("cancelTransaction cancels hold and resets transaction", () => {
  return expectSaga(cancelTransaction, holdReservation)
    .provide([
      [matchers.call.fn(releaseServerCall), null],
    ])
    .call(releaseServerCall, holdReservation)
    .put(resetTransaction())
    .run()
})

describe("common to all flows", () => {
  test("starts with hold call to server", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [matchers.call.fn(reserveTicketServerCall), null],
        [matchers.call.fn(releaseServerCall), null],
      ])
      .dispatch(
        startTicketAbort({
          reservation: holdReservation,
          reason: "Abort! Abort",
        })
      )
      .call(reserveTicketServerCall, holdReservation)
      .run();
  });
  test("show error toast and clean up after server error", ()=>{
    return expectSaga(ticketFlow, holdAction)
    .provide([
      [matchers.call.fn(reserveTicketServerCall), throwError(new Error(`it doesn't work`))],
      [matchers.select.selector(selectors.getTicketAction), TicketAction.hold],
      [matchers.call.fn(releaseServerCall), null],
    ])
    // provide to select
    // assert on toast action
    .put(
      showToast(generateErrorToastOptions(`it doesn't work`, TicketAction.hold))
    )
    .call(cancelTransaction, holdReservation)
    // .put(resetTransaction())
    .run();
  })
});

describe("purchase flow", ()=>{
  test("network error on purchase show toast and cancels transaction", ()=>{
    return expectSaga(ticketFlow, holdAction)
    .provide([
      [matchers.call.like({
        fn: reserveTicketServerCall,
        args: [purchaseReservation]
      }), throwError(new Error('it do not work'))],
      [matchers.select.selector(selectors.getTicketAction), TicketAction.hold],
      ...networkProviders
    ])
    .dispatch(startTicketPurchase(purchasePayload))
    .call(cancelPurchaseServerCall, purchaseReservation)
    .put(showToast(generateErrorToastOptions('it do not work', TicketAction.hold)))
    .call(cancelTransaction, holdReservation)
    .run()
  })

  test("abort purchase while call to server is running", ()=>{
    const cancelSource = axios.CancelToken.source();
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
    .provide([
      ...networkProviders,
      [
        race({
          purchaseResult: call(
            reserveTicketServerCall,
            purchaseReservation,
            cancelSource.token
          ),
          abort: take(startTicketAbort.type),
        }),
        {abort: true}
      ]
    ])
    .call(cancelSource.cancel)
    .call(cancelPurchaseServerCall, purchaseReservation)
    .put(showToast({ title: "purchase canceled", status: "warning" }))
    .call(cancelTransaction, holdReservation)
    .not.put(showToast({ title: "tickets purchased", status: "success" }))
    .run()
  })
  test("purchase success", ()=>{
    const cancelSource = axios.CancelToken.source();
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
    .provide([
      ...networkProviders,
    ])
    .call(reserveTicketServerCall, purchaseReservation, cancelSource.token)
    .put(showToast({ title: "tickets purchased", status: "success" }))
    .call(releaseServerCall, holdReservation)
    .put(endTransaction())
    .not.call(cancelPurchaseServerCall, purchaseReservation)
    .not.put(showToast({ title: "purchase canceled", status: "warning" }))
    .not.call(cancelTransaction, holdReservation)
    .run()
  })
})

describe("hold cancellation", () => {
  test.each([
    {
      name: "cancel",
      actionCreator: startTicketAbort
    },
    {
      name: "abort",
      actionCreator: startTicketRelease
    }
  ])
  ("cancel hold and reset ticket transaction", async({actionCreator})=>{
    return expectSaga(ticketFlow,holdAction)
    .provide(networkProviders)
    .dispatch(actionCreator({
      reservation: holdReservation, reason:'reason'
    }))
    .put(showToast({ title: 'reason', status: "warning" }))
    .call(cancelTransaction, holdReservation)
    .run()
  })
})