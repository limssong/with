export interface Course {
  id: string;
  name: string;
  description: string;
  distance: number; // km
  difficulty: 'easy' | 'medium' | 'hard';
  elevation: number; // m
  location: string;
  region: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  coordinates: { lat: number; lng: number }[];
  tags: string[];
  createdBy: string;
}

export const courses: Course[] = [
  {
    id: 'yeouido-hangang',
    name: '여의도 한강공원 코스',
    description: '여의도 한강공원을 따라 달리는 평탄한 코스. 벚꽃 시즌에 특히 인기가 많습니다.',
    distance: 5.2,
    difficulty: 'easy',
    elevation: 12,
    location: '여의도 한강공원',
    region: '서울 영등포구',
    imageUrl: '/images/course-yeouido.jpg',
    rating: 4.8,
    reviewCount: 342,
    coordinates: [
      { lat: 37.5283, lng: 126.9322 },
      { lat: 37.5265, lng: 126.9410 },
    ],
    tags: ['평지', '한강', '야경'],
    createdBy: '러닝매니아',
  },
  {
    id: 'banpo-hangang',
    name: '반포 한강공원 코스',
    description: '반포대교 달빛무지개분수를 감상하며 달리는 야경 코스.',
    distance: 7.0,
    difficulty: 'easy',
    elevation: 8,
    location: '반포 한강공원',
    region: '서울 서초구',
    imageUrl: '/images/course-banpo.jpg',
    rating: 4.7,
    reviewCount: 289,
    coordinates: [
      { lat: 37.5091, lng: 126.9948 },
      { lat: 37.5120, lng: 127.0100 },
    ],
    tags: ['평지', '한강', '야경', '분수'],
    createdBy: '나이트러너',
  },
  {
    id: 'bukhansan-trail',
    name: '북한산 둘레길 코스',
    description: '북한산 둘레길을 따라 자연 속에서 트레일러닝을 즐길 수 있는 코스.',
    distance: 10.5,
    difficulty: 'hard',
    elevation: 320,
    location: '북한산 둘레길',
    region: '서울 강북구',
    imageUrl: '/images/course-bukhansan.jpg',
    rating: 4.9,
    reviewCount: 178,
    coordinates: [
      { lat: 37.6584, lng: 126.9780 },
      { lat: 37.6610, lng: 126.9850 },
    ],
    tags: ['트레일', '산', '자연', '고급'],
    createdBy: '트레일블레이저',
  },
  {
    id: 'ttukseom-hangang',
    name: '뚝섬 한강공원 코스',
    description: '뚝섬유원지역에서 출발하는 한강변 러닝 코스. 넓은 트랙이 매력.',
    distance: 6.3,
    difficulty: 'easy',
    elevation: 5,
    location: '뚝섬 한강공원',
    region: '서울 광진구',
    imageUrl: '/images/course-ttukseom.jpg',
    rating: 4.6,
    reviewCount: 256,
    coordinates: [
      { lat: 37.5316, lng: 127.0660 },
      { lat: 37.5340, lng: 127.0750 },
    ],
    tags: ['평지', '한강', '넓은트랙'],
    createdBy: '한강러너',
  },
  {
    id: 'olympic-park',
    name: '올림픽공원 순환 코스',
    description: '올림픽공원 내 순환 도로를 따라 달리는 쾌적한 코스.',
    distance: 8.0,
    difficulty: 'medium',
    elevation: 45,
    location: '올림픽공원',
    region: '서울 송파구',
    imageUrl: '/images/course-olympic.jpg',
    rating: 4.7,
    reviewCount: 412,
    coordinates: [
      { lat: 37.5209, lng: 127.1230 },
      { lat: 37.5180, lng: 127.1300 },
    ],
    tags: ['공원', '순환', '쾌적'],
    createdBy: '올림픽러너',
  },
  {
    id: 'seongsu-hangang',
    name: '성수~잠실 한강 코스',
    description: '성수대교에서 잠실대교까지 한강 남측 도로를 따라 달리는 롱런 코스.',
    distance: 12.0,
    difficulty: 'medium',
    elevation: 15,
    location: '성수~잠실 한강변',
    region: '서울 성동구',
    imageUrl: '/images/course-seongsu.jpg',
    rating: 4.5,
    reviewCount: 198,
    coordinates: [
      { lat: 37.5405, lng: 127.0490 },
      { lat: 37.5180, lng: 127.0900 },
    ],
    tags: ['한강', '장거리', '다리'],
    createdBy: '마라토너킴',
  },
];
