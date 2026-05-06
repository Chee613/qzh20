"use client";

export type CommitteeMember = {
  displayId: number;
  id: string;
  image: string;
  name: string;
};

export type CommitteeGroup = {
  members: CommitteeMember[];
  sticker: string;
  title: string;
};
