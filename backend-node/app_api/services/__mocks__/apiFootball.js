const mockSearchPlayers = jest.fn();
const mockGetPlayerById = jest.fn();

const __resetMocks = () => {
  mockSearchPlayers.mockReset();
  mockGetPlayerById.mockReset();
};

module.exports = {
  searchPlayers: mockSearchPlayers,
  getPlayerById: mockGetPlayerById,
  __mockSearchPlayers: mockSearchPlayers,
  __mockGetPlayerById: mockGetPlayerById,
  __resetMocks,
};
