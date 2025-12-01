import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import Minigame from '@/components/minigames/Minigame';

export default function MinigamesPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <Minigame />
      </div>
    </MainLayout>
  );
}
