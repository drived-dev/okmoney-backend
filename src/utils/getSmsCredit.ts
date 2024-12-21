export function getSmsCredit(rolePackage) {
  switch (rolePackage) {
    case 'FREE':
      return 10;
    case 'SMALL':
      return 20;
    case 'MEDIUM':
      return 30;
    case 'LARGE':
      return 40;
    default:
      return 0;
  }
}
