import { MockAuthGuard } from './mock-auth.guard';

describe('MockAuthGuard', () => {
    it('should be defined', () => {
        expect(new MockAuthGuard()).toBeDefined();
    });
});
