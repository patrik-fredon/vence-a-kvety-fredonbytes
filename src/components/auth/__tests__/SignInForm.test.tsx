// Mock Next.js navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockGet = jest.fn().mockReturnValue(null);

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock auth hooks
const mockSignIn = jest.fn();
jest.mock("@/lib/auth/hooks", () => ({
  useSignIn: () => ({
    signIn: mockSignIn,
    loading: false,
    error: null,
  }),
}));

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SignInForm } from "../SignInForm";

describe("SignInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  it("renders sign in form correctly", () => {
    render(<SignInForm />);

    expect(screen.getByText("Přihlášení")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Heslo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Přihlásit se" })).toBeInTheDocument();
  });

  it("handles form submission successfully", async () => {
    mockSignIn.mockResolvedValue({ success: true });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Heslo"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Přihlásit se" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("redirects to callback URL after successful sign in", async () => {
    mockGet.mockReturnValue("/profile");
    mockSignIn.mockResolvedValue({ success: true });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Heslo"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Přihlásit se" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });
  });
});
