export type AccessStatus = 'Granted' | 'Denied';

export type AccessLogEntry = {
  id: string;
  userName: string;
  cardUID: string;
  timestamp: string;
  status: AccessStatus;
  reason: string;
};

export type CardData = {
  cardUID: string;
  block1Data: string;
  block2Data: string;
  userName: string;
};
