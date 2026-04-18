export interface CrewMember {
  id: string;
  name: string;
  profileImage: string;
  pace: string;
  status: 'accepted' | 'pending' | 'rejected';
}

export interface Crew {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  hostName: string;
  hostImage: string;
  date: string;
  time: string;
  pace: string;
  distance: number;
  maxMembers: number;
  currentMembers: number;
  members: CrewMember[];
  location: string;
  region: string;
  tags: string[];
  status: 'upcoming' | 'full' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recurringDay?: string;
}

export const crews: Crew[] = [
  {
    id: 'crew-1',
    title: '여의도 저녁 러닝 같이해요!',
    description: '퇴근 후 가볍게 한강변을 달려요. 초보자도 환영합니다! 페이스 맞춰서 함께 뛸게요.',
    courseId: 'yeouido-hangang',
    courseName: '여의도 한강공원 코스',
    hostName: '러닝매니아',
    hostImage: '/images/avatar-1.jpg',
    date: '2026-04-08',
    time: '19:00',
    pace: '6:00~6:30',
    distance: 5.2,
    maxMembers: 8,
    currentMembers: 5,
    members: [
      { id: 'u1', name: '러닝매니아', profileImage: '/images/avatar-1.jpg', pace: '5:45', status: 'accepted' },
      { id: 'u2', name: '달리기좋아', profileImage: '/images/avatar-2.jpg', pace: '6:10', status: 'accepted' },
      { id: 'u3', name: '한강러너', profileImage: '/images/avatar-3.jpg', pace: '6:20', status: 'accepted' },
      { id: 'u4', name: '초보러너', profileImage: '/images/avatar-4.jpg', pace: '6:45', status: 'accepted' },
      { id: 'u5', name: '나이트런', profileImage: '/images/avatar-5.jpg', pace: '6:00', status: 'accepted' },
      { id: 'u6', name: '신청자1', profileImage: '/images/avatar-6.jpg', pace: '6:30', status: 'pending' },
    ],
    location: '여의도 한강공원 마포대교 하부',
    region: '서울 영등포구',
    tags: ['초보환영', '저녁러닝', '한강'],
    status: 'upcoming',
    isRecurring: true,
    recurringDay: '매주 화요일',
  },
  {
    id: 'crew-2',
    title: '반포 야경 러닝 크루',
    description: '반포대교 분수를 보면서 달려요. 매주 수요일 7시 반포 한강공원 집합!',
    courseId: 'banpo-hangang',
    courseName: '반포 한강공원 코스',
    hostName: '나이트러너',
    hostImage: '/images/avatar-2.jpg',
    date: '2026-04-09',
    time: '19:30',
    pace: '5:30~6:00',
    distance: 7.0,
    maxMembers: 10,
    currentMembers: 8,
    members: [],
    location: '반포 한강공원 달빛광장',
    region: '서울 서초구',
    tags: ['야경', '중급', '정기러닝'],
    status: 'upcoming',
    isRecurring: true,
    recurringDay: '매주 수요일',
  },
  {
    id: 'crew-3',
    title: '주말 북한산 트레일런!',
    description: '토요일 아침 북한산 둘레길 트레일런! 체력 소모가 크니 경험자 추천합니다.',
    courseId: 'bukhansan-trail',
    courseName: '북한산 둘레길 코스',
    hostName: '트레일블레이저',
    hostImage: '/images/avatar-3.jpg',
    date: '2026-04-12',
    time: '07:00',
    pace: '7:00~8:00',
    distance: 10.5,
    maxMembers: 6,
    currentMembers: 6,
    members: [],
    location: '북한산 둘레길 입구',
    region: '서울 강북구',
    tags: ['트레일런', '상급', '주말'],
    status: 'full',
    isRecurring: false,
  },
  {
    id: 'crew-4',
    title: '올림픽공원 새벽 러닝',
    description: '새벽 5시 반 올림픽공원에서 출발합니다. 상쾌한 아침 공기를 마시며 달려요!',
    courseId: 'olympic-park',
    courseName: '올림픽공원 순환 코스',
    hostName: '올림픽러너',
    hostImage: '/images/avatar-4.jpg',
    date: '2026-04-07',
    time: '05:30',
    pace: '5:00~5:30',
    distance: 8.0,
    maxMembers: 12,
    currentMembers: 4,
    members: [],
    location: '올림픽공원 평화의문',
    region: '서울 송파구',
    tags: ['새벽러닝', '중급', '공원'],
    status: 'upcoming',
    isRecurring: true,
    recurringDay: '매주 월/수/금',
  },
  {
    id: 'crew-5',
    title: '뚝섬 초보 러닝 모임',
    description: '처음 러닝 시작하는 분들을 위한 모임! 걷기와 달리기를 번갈아 하며 천천히 시작해요.',
    courseId: 'ttukseom-hangang',
    courseName: '뚝섬 한강공원 코스',
    hostName: '한강러너',
    hostImage: '/images/avatar-5.jpg',
    date: '2026-04-10',
    time: '18:30',
    pace: '7:00~8:00',
    distance: 3.0,
    maxMembers: 15,
    currentMembers: 9,
    members: [],
    location: '뚝섬유원지역 2번 출구',
    region: '서울 광진구',
    tags: ['초보환영', '워크런', '한강'],
    status: 'upcoming',
    isRecurring: false,
  },
];
