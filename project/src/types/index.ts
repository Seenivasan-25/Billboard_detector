export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  level: number;
  reports: number;
  joinDate: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Report {
  id: string;
  userId: string;
  image: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  status: 'violation' | 'compliant' | 'pending';
  extractedText: string;
  violationType?: string;
  points: number;
}

export interface LeaderboardEntry {
  user: User;
  rank: number;
  monthlyPoints: number;
}