/**
 * @jest-environment jsdom
 */

import { getByRole, getByText, render, screen } from "../../../test-utils";
import { Shows } from "./Shows";

test("displays relevant show details for non-sold-out show", async () => {
  render(<Shows />);
  const listLi = await screen.findAllByRole("listitem");
  const nonShowOut = listLi[0];
  const button = getByRole(nonShowOut, "button", {
    name: /tickets/i,
  });
  expect(button).toBeInTheDocument();
  const heading = getByRole(nonShowOut, "heading", {
    name: /Avalanche of Cheese/i,
  });
  expect(heading).toBeInTheDocument();
  const description = getByText(
    nonShowOut,
    /rollicking country with ambitious kazoo solos/i
  );
  expect(description).toBeInTheDocument();
});

test("displays relevant show details for sold-out show", async () => {
  render(<Shows />);
  const listLi = await screen.findAllByRole("listitem");
  const nonShowOut = listLi[1];
  const button = getByRole(nonShowOut, "button", {
    name: /sold out/i,
  });
  expect(button).toBeInTheDocument();
  const heading = getByRole(nonShowOut, "heading", {
    name: /The Joyous Nun Riot/i,
  });
  expect(heading).toBeInTheDocument();
  const description = getByText(
    nonShowOut,
    /serious world music with an iconic musical saw/i
  );
  expect(description).toBeInTheDocument();
})