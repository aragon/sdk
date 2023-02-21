export function isProposalId(propoosalId: string): boolean {
  const regex = new RegExp(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/i);
  return regex.test(propoosalId);
}
