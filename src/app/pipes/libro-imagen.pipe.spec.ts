import { LibroImagenPipe } from './libro-imagen.pipe';
import { LibroModel } from '../models/libro.model';

describe('LibroImagenPipe', () => {
  let pipe: LibroImagenPipe;

  beforeEach(() => {
    pipe = new LibroImagenPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return OpenLibrary cover URL when ISBN exists', () => {
    const libro = new LibroModel();
    libro.isbn = '978-3-16-148410-0';

    const result = pipe.transform(libro);

    expect(result).toBe('http://covers.openlibrary.org/b/isbn/978-3-16-148410-0-M.jpg');
  });

  it('should return no-image when ISBN is empty', () => {
    const libro = new LibroModel();
    libro.isbn = '';

    const result = pipe.transform(libro);

    expect(result).toBe('assets/img/no-image.gif');
  });

  it('should return no-image when ISBN is null', () => {
    const libro = new LibroModel();
    libro.isbn = null;

    const result = pipe.transform(libro);

    expect(result).toBe('assets/img/no-image.gif');
  });

  it('should return no-image when ISBN is undefined', () => {
    const libro = new LibroModel();

    const result = pipe.transform(libro);

    expect(result).toBe('assets/img/no-image.gif');
  });
});
