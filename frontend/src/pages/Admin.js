import React from 'react';

export default function Admin(){
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin (stub)</h2>
      <p>This page is a placeholder for room management, bookings overview, offers and review moderation.</p>
      <ul className="list-disc ml-6 mt-3">
        <li>Add / edit / delete rooms (API: POST /api/rooms)</li>
        <li>View all bookings (API: GET /api/bookings)</li>
        <li>Manage offers (API: /api/offers)</li>
        <li>Approve reviews (PATCH /api/reviews/:id/approve)</li>
      </ul>
    </div>
  );
}
