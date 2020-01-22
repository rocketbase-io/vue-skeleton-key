const xhrMockClass = () => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn()
});

window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass) as any;
window.fetch = jest.fn() as any;
