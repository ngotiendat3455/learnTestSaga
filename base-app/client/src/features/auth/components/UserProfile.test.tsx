import { render, screen } from "../../../test-utils";
import {UserProfile} from "./UserProfile";
import { App } from '../../../App';

const testUser = {
  email: "booker@avalancheofcheese.com",
};

test("greets the user", () => {
  render(<UserProfile />, {
    preloadedState: {
      user: {
        userDetails: testUser,
      },
    },
  });
  expect(
    screen.getByText(/Hi, booker@avalancheofcheese.com/i)
  ).toBeInTheDocument();
});

test("redirects if user is falsy", ()=>{
    render(<UserProfile />);
    expect(
        screen.queryByText(/Hi, booker@avalancheofcheese.com/i)
      ).not.toBeInTheDocument();
})

// redirects to signin if user is failsy
test("redirects to signin if user is failsy", ()=>{
  const {history} = render(<UserProfile />);
  expect(history.location.pathname).toBe('/signIn');
})

// view sign-in page when loading profile while not logged
test("view sign-in page when loading profile while not logged", ()=>{
  render(<App />, {
    routeHistory: [
      "/profile"
    ]
  });
  expect(screen.getByRole('heading', {
    name: /Sign in to your account/i
  })).toBeInTheDocument();

})