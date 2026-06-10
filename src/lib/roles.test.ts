import { describe, expect, it, vi } from "vitest";
import { getUserRoles, hasRole, requireRole } from "./roles";

describe("roles helper functions", () => {
  describe("getUserRoles", () => {
    it("returns array of roles on success", async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({
                data: [{ role: "client" }, { role: "architect" }],
                error: null,
              })
            ),
          })),
        })),
      };

      const roles = await getUserRoles(mockSupabase, "user-id");
      expect(roles).toEqual(["client", "architect"]);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_roles");
    });

    it("returns empty array on error", async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({
                data: null,
                error: new Error("Db error"),
              })
            ),
          })),
        })),
      };

      const roles = await getUserRoles(mockSupabase, "user-id");
      expect(roles).toEqual([]);
    });
  });

  describe("hasRole", () => {
    it("returns true if user has the role", async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({
                data: [{ role: "client" }],
                error: null,
              })
            ),
          })),
        })),
      };

      const hasClient = await hasRole(mockSupabase, "user-id", "client");
      expect(hasClient).toBe(true);

      const hasAdmin = await hasRole(mockSupabase, "user-id", "admin");
      expect(hasAdmin).toBe(false);
    });
  });

  describe("requireRole", () => {
    it("returns user id if user has role", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn(() =>
            Promise.resolve({
              data: { user: { id: "user-id" } },
              error: null,
            })
          ),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({
                data: [{ role: "admin" }],
                error: null,
              })
            ),
          })),
        })),
      };

      const userId = await requireRole(mockSupabase, "admin");
      expect(userId).toBe("user-id");
    });

    it("throws unauthorized if no session found", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn(() =>
            Promise.resolve({
              data: { user: null },
              error: null,
            })
          ),
        },
      };

      await expect(requireRole(mockSupabase, "admin")).rejects.toThrow(
        "Unauthorized: No session found"
      );
    });

    it("throws forbidden if role is missing", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn(() =>
            Promise.resolve({
              data: { user: { id: "user-id" } },
              error: null,
            })
          ),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({
                data: [{ role: "client" }],
                error: null,
              })
            ),
          })),
        })),
      };

      await expect(requireRole(mockSupabase, "admin")).rejects.toThrow(
        "Forbidden: Required role 'admin' missing"
      );
    });
  });
});
