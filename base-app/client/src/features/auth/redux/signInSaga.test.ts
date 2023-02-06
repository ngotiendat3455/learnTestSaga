import { expectSaga, testSaga } from "redux-saga-test-plan";
import { holdReservation, purchasePayload, purchaseReservation } from "../../../test-utils/fake-data";
import * as matchers from "redux-saga-test-plan/matchers";
import { AuthenticateAction,LoggedInUser, SignInDetails,SignInStatus} from "../types";
import { cancelTransaction, generateErrorToastOptions, purchaseTickets, ticketFlow } from "./ticketSaga";
import { authServerCall,clearStoredUser,getStoredUser,setStoredUser } from "../api";
import { endTransaction, resetTransaction, selectors, startTicketAbort, startTicketPurchase, startTicketRelease } from "./ticketSlice";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";
import { showToast } from "../../toast/redux/toastSlice";
import {
  HoldReservation,
} from "../../../../../shared/types";
import axios from "axios";
import { take, call, race, cancel } from "redux-saga/effects";
import { authenticateUser, signInFlow } from "./signInSaga";
import { cancelSignIn, endSignIn, signIn, signInRequest, signOut, startSignIn } from "./authSlice";
import { createMockTask } from "@redux-saga/testing-utils";

/**
 * booker@avalancheofcheese.com
abc123
 */
const temp:SignInDetails = {
    email: 'booker@avalancheofcheese.com',
    password: 'abc123',
    action: "signIn"
}

const networkProviders: Array<StaticProvider>= [
    [matchers.call.fn(authServerCall), null]
  ];
describe("signInFlow Saga", () => {
    // successfull signin
    test("successfull signin", () => {
        return expectSaga(signInFlow)
        .provide(networkProviders)
        .dispatch(signInRequest(temp))
        .fork(authenticateUser,temp)
        .put(startSignIn())
        .call(authServerCall, temp)
        .put.actionType(signIn.type)
        .put.actionType(showToast.type)
        .put(endSignIn())
        .silentRun()
    })
    // successfull signup
    // cancelled signin
    test("cancelled signin", () => {
        return expectSaga(signInFlow)
        .provide({
            call:async(effect,next)=>{
                if(effect.fn === authServerCall){
                    await new Promise((resolve, error)=>{
                        setTimeout(() => {
                            resolve(true)
                        }, 500)
                    });
                }
                next();
            }
        })
        .dispatch(signInRequest(temp))
        .fork(authenticateUser,temp)
        .dispatch(cancelSignIn())
        .put(showToast({ title: "Sign in canceled", status: "warning" }))
        .put(signOut())
        .put(endSignIn())
        .silentRun()
    })
    // signin error
    test("signin error", () => {
        return expectSaga(signInFlow)
        .provide([
            [matchers.call.fn(authServerCall), throwError(new Error('something'))]
        ])
        .dispatch(signInRequest(temp))
        .fork(authenticateUser,temp)
        .put(startSignIn())
        .put(
            showToast({
              title: `Sign in failed: something`,
              status: "warning",
            })
          )
        .put(endSignIn())
        .silentRun()
    })
})

describe("unit tests for fork cancellation", () => {
    test("saga cancel flow", () => {
        const saga = testSaga(signInFlow);
        const task = createMockTask();
        saga.next().take(signInRequest.type);
        saga.next({
            type:'test',
            payload: temp
        })
            .fork(authenticateUser, temp)
        saga.next(task).take([cancelSignIn.type, endSignIn.type])
        saga.next(cancelSignIn()).cancel(task)
    })
    test("saga successfull signin", () => {
        const saga = testSaga(signInFlow);
        const task = createMockTask();
        saga.next().take(signInRequest.type);
        saga.next({
            type:'test',
            payload: temp
        })
            .fork(authenticateUser, temp);
        saga.next(task).take([cancelSignIn.type, endSignIn.type])
        saga.next(endSignIn()).take(signInRequest.type);
    })
})