import { ResourceType } from '../resources';

describe('bridge-res', () => {

  describe('image', () => {

    describe('resolveSourceImage', () => {

      let image: typeof import('../image');
      let fsMock: { [key: string]: jest.Mock };
      let resourcesMock: { RASTER_RESOURCE_VALIDATORS: { [key: string]: jest.Mock } };

      beforeEach(async () => {
        jest.resetModules();

        fsMock = {
          readFile: jest.fn(),
          writeFile: jest.fn(),
        };

        resourcesMock = {
          RASTER_RESOURCE_VALIDATORS: {
            [ResourceType.ICON]: jest.fn(),
          },
        };

        jest.mock('@ionic/utils-fs', () => fsMock);
        jest.mock('../resources', () => resourcesMock);

        image = await import('../image');
      });

      it('should throw with empty array of source images', async () => {
        await expect(image.resolveSourceImage(ResourceType.ICON, [])).rejects.toThrow('Missing source image');
        expect(fsMock.readFile).not.toHaveBeenCalled();
      });

      it('should throw with source image with error', async () => {
        fsMock.readFile.mockImplementation(async () => { throw new Error('err'); });
        await expect(image.resolveSourceImage(ResourceType.ICON, ['blah.png'])).rejects.toThrow('Missing source image');
        expect(fsMock.readFile).toHaveBeenCalledTimes(1);
      });

      it('should resolve with proper image', async () => {
        fsMock.readFile.mockImplementationOnce(async () => { throw new Error('err'); });
        fsMock.readFile.mockImplementationOnce(async () => Buffer.from([]));
        const { src } = await image.resolveSourceImage(ResourceType.ICON, ['foo.png', 'bar.png']);
        expect(src).toEqual('bar.png');
        expect(fsMock.readFile).toHaveBeenCalledTimes(2);
        expect(resourcesMock.RASTER_RESOURCE_VALIDATORS[ResourceType.ICON]).toHaveBeenCalledTimes(1);
      });

    });

  });

});
