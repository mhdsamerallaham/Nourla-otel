import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import BookingWidget from '../components/ui/BookingWidget';

export default function Reservation() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const roomIdFromUrl = searchParams.get('room') || '';

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t('nav.reserve')}
          title={t('reservation.title')}
          subtitle={t('reservation.subtitle')}
        />

        <BookingWidget preselectedRoomId={roomIdFromUrl} />
      </div>
    </div>
  );
}
