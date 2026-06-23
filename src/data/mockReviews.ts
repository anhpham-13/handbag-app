import { Review } from '../types/review';

// Reviews are keyed by handbag ID. IDs '1'-'10' cover typical MockAPI sequential IDs.
// For any other ID, generateReviewsForId() creates plausible reviews.

const BASE_REVIEWS: Review[] = [
  { id: 'r1', handbagId: '1', author: 'Sophie L.', rating: 5, comment: 'Absolutely stunning! The leather quality is exceptional and the gold hardware is divine. Worth every penny.', date: '2024-03-10', avatar: 'SL' },
  { id: 'r2', handbagId: '1', author: 'Emma K.', rating: 5, comment: 'My dream bag has finally arrived. The craftsmanship is impeccable. Received so many compliments.', date: '2024-02-28', avatar: 'EK' },
  { id: 'r3', handbagId: '1', author: 'Olivia M.', rating: 4, comment: 'Beautiful design and excellent quality. Only minor issue is the interior pockets could be larger.', date: '2024-02-14', avatar: 'OM' },
  { id: 'r4', handbagId: '1', author: 'Claire D.', rating: 4, comment: 'Elegant and very well made. The color is exactly as shown. Fast shipping too!', date: '2024-01-30', avatar: 'CD' },
  { id: 'r5', handbagId: '1', author: 'Mia R.', rating: 3, comment: 'Pretty bag but arrived with a small scratch. Customer service was helpful in resolving the issue.', date: '2024-01-15', avatar: 'MR' },
  { id: 'r6', handbagId: '1', author: 'Isabella F.', rating: 5, comment: 'Perfect for every occasion. I bought this for work and it holds everything I need.', date: '2024-01-05', avatar: 'IF' },

  { id: 'r7', handbagId: '2', author: 'Natalie B.', rating: 5, comment: 'This bag is a showstopper. The structured silhouette is timeless and the stitching is flawless.', date: '2024-03-08', avatar: 'NB' },
  { id: 'r8', handbagId: '2', author: 'Hannah W.', rating: 4, comment: 'Gorgeous bag, very luxurious feel. Slightly heavier than expected but absolutely worth it.', date: '2024-02-20', avatar: 'HW' },
  { id: 'r9', handbagId: '2', author: 'Grace T.', rating: 3, comment: 'Nice bag but the price is a bit steep for what you get. Still happy with the purchase overall.', date: '2024-02-05', avatar: 'GT' },
  { id: 'r10', handbagId: '2', author: 'Zoe A.', rating: 5, comment: 'Fell in love the moment I saw it in person. The colour is even more beautiful than the photos.', date: '2024-01-22', avatar: 'ZA' },

  { id: 'r11', handbagId: '3', author: 'Ava C.', rating: 5, comment: 'This is my third purchase from this brand and they never disappoint. Superb quality.', date: '2024-03-12', avatar: 'AC' },
  { id: 'r12', handbagId: '3', author: 'Lily P.', rating: 4, comment: 'Elegant and practical. The compartments are well thought out. Great for travel.', date: '2024-02-25', avatar: 'LP' },
  { id: 'r13', handbagId: '3', author: 'Chloe V.', rating: 5, comment: 'Received this as a birthday gift and I am obsessed. The material is so soft.', date: '2024-02-10', avatar: 'CV' },
  { id: 'r14', handbagId: '3', author: 'Ruby H.', rating: 2, comment: 'The colour in person was slightly different from the website photo. Disappointed.', date: '2024-01-28', avatar: 'RH' },

  { id: 'r15', handbagId: '4', author: 'Jasmine S.', rating: 5, comment: 'Perfect everyday bag. Light enough to carry all day and looks expensive.', date: '2024-03-15', avatar: 'JS' },
  { id: 'r16', handbagId: '4', author: 'Aria N.', rating: 4, comment: 'Good quality for the price point. The clasp is sturdy and the lining is beautiful.', date: '2024-03-01', avatar: 'AN' },
  { id: 'r17', handbagId: '4', author: 'Violet G.', rating: 5, comment: 'Exactly what I was looking for. Classic style that will never go out of fashion.', date: '2024-02-16', avatar: 'VG' },
  { id: 'r18', handbagId: '4', author: 'Penelope J.', rating: 3, comment: 'Decent quality but the strap length could be adjusted more. Otherwise fine.', date: '2024-01-10', avatar: 'PJ' },

  { id: 'r19', handbagId: '5', author: 'Stella Q.', rating: 5, comment: 'Absolute perfection. Every detail is immaculate. A true luxury experience.', date: '2024-03-18', avatar: 'SQ' },
  { id: 'r20', handbagId: '5', author: 'Nora X.', rating: 4, comment: 'Beautiful structured bag. Fits everything I need for the office. Very professional look.', date: '2024-03-05', avatar: 'NX' },
  { id: 'r21', handbagId: '5', author: 'Luna E.', rating: 5, comment: 'The photos do not do justice to how stunning this bag is in person. Obsessed!', date: '2024-02-22', avatar: 'LE' },
];

// Generates synthetic reviews for handbag IDs not covered above
export const generateReviewsForId = (handbagId: string): Review[] => {
  const templates = [
    { rating: 5, comment: 'Absolutely love this bag. The quality exceeds expectations and the design is timeless.' },
    { rating: 5, comment: 'Worth every cent. The materials feel premium and the construction is solid.' },
    { rating: 4, comment: 'Beautiful handbag. Slightly smaller than I expected but the quality is excellent.' },
    { rating: 4, comment: 'Great purchase. The colour is rich and vibrant. Would highly recommend.' },
    { rating: 3, comment: 'Decent bag for the price. Nothing extraordinary but solid quality.' },
    { rating: 5, comment: 'Gift for my mother and she was thrilled. Packaging was immaculate.' },
    { rating: 4, comment: 'Classic and elegant. Perfect for formal occasions.' },
    { rating: 2, comment: 'Expected a bit more given the price. The seams are not perfectly aligned.' },
  ];
  const authors = ['A.M.', 'B.K.', 'C.L.', 'D.P.', 'E.R.', 'F.S.', 'G.T.', 'H.V.'];
  const dates = ['2024-03-20', '2024-03-10', '2024-02-28', '2024-02-15', '2024-02-01', '2024-01-20', '2024-01-08', '2023-12-25'];

  return templates.map((t, i) => ({
    id: `gen_${handbagId}_${i}`,
    handbagId,
    author: authors[i % authors.length],
    rating: t.rating,
    comment: t.comment,
    date: dates[i % dates.length],
    avatar: authors[i % authors.length].replace('.', '').replace('.', ''),
  }));
};

export const getReviewsForHandbag = (handbagId: string): Review[] => {
  const specific = BASE_REVIEWS.filter(r => r.handbagId === handbagId);
  return specific.length > 0 ? specific : generateReviewsForId(handbagId);
};

export const MOCK_REVIEWS = BASE_REVIEWS;
