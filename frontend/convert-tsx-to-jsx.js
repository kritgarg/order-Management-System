import { convertTsxToJsx } from 'tsx-to-jsx';

const srcDirectory = 'src';
const destDirectory = 'src-jsx'; // You can change this if you want a different output directory

await convertTsxToJsx(srcDirectory, destDirectory);

convertTsxToJsx(srcDirectory, destDirectory)
  .then(() => {
    console.log('All TSX files have been converted to JSX!');
  })
  .catch((err) => {
    console.error('Error during conversion:', err);
  }); 