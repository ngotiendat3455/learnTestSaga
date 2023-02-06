import { fireEvent, render, screen } from "../../../test-utils";
import { NavBar } from "./NavBar";
import { App } from "../../../App";

const testUser = {
  email: "booker@avalancheofcheese.com",
};

test("click signin button and push 'signin' page", () => {
  const { history } = render(<NavBar />);
  const signInButton = screen.getByRole("button", {
    name: /Sign in/i,
  });
  fireEvent.click(signInButton);
  expect(history.location.pathname).toBe("/signIn");
});

test("clicking sign-in button shows sign-in page", () => {
  render(<App />);
  const signInButton = screen.getByRole("button", {
    name: /Sign in/i,
  });
  fireEvent.click(signInButton);
  expect(
    screen.getByRole("heading", {
      name: /Sign in to your account/i,
    })
  ).toBeInTheDocument();
});

describe("display when signed in / not signed in", () => {
  test("display sign in button when user is falsy", () => {
    render(<NavBar />);
    const signInButton = screen.getByRole("button", {
      name: /Sign in/i,
    });
    expect(signInButton).toBeInTheDocument();
  });
  test("display sign out button and user email when user is not null", () => {
    render(<NavBar />, {
      preloadedState: {
        user: {
          userDetails: testUser,
        },
      },
    });
    const signOutButton = screen.getByRole("button", {
        name: /Sign out/i,
      });
      expect(signOutButton).toBeInTheDocument();
  });
});
