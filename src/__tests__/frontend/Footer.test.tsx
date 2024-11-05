```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '@/pages/Footer';

describe('Footer コンポーネント', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('フッターが正常にレンダリングされる', () => {
    render(<Footer />);
    
    expect(screen.getByText('運営会社')).toBeInTheDocument();
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
    expect(screen.getByText('利用規約')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
    expect(screen.getByText('© 2024 Event Manager All rights reserved.')).toBeInTheDocument();
  });

  it('フッターリンクをクリックするとリンク先に遷移する', () => {
    render(<Footer />);

    const companyLink = screen.getByText('運営会社');
    const privacyLink = screen.getByText('プライバシーポリシー');
    const termsLink = screen.getByText('利用規約');
    const contactLink = screen.getByText('お問い合わせ');

    fireEvent.click(companyLink);
    fireEvent.click(privacyLink);
    fireEvent.click(termsLink); 
    fireEvent.click(contactLink);

    expect(mockNavigate).toHaveBeenCalledTimes(4);
  });

  it('ソーシャルメディアアイコンが表示される', () => {
    render(<Footer />);

    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
  });

  it('ソーシャルメディアアイコンをクリックすると対応するURLが開かれる', () => {
    const mockWindow = jest.spyOn(window, 'open').mockImplementation();
    render(<Footer />);

    fireEvent.click(screen.getByTestId('twitter-icon'));
    expect(mockWindow).toHaveBeenCalledWith('https://twitter.com/eventmanager', '_blank');

    fireEvent.click(screen.getByTestId('facebook-icon'));
    expect(mockWindow).toHaveBeenCalledWith('https://facebook.com/eventmanager', '_blank');

    fireEvent.click(screen.getByTestId('instagram-icon'));
    expect(mockWindow).toHaveBeenCalledWith('https://instagram.com/eventmanager', '_blank');
  });

  it('レスポンシブデザインの確認', () => {
    const { container } = render(<Footer />);
    
    expect(container.firstChild).toHaveClass('footer-container');
    expect(container.querySelector('.footer-links')).toHaveClass('footer-links');
    expect(container.querySelector('.social-icons')).toHaveClass('social-icons');
  });

  it('アクセシビリティ要件を満たしている', () => {
    render(<Footer />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('aria-label');
    });

    const socialIcons = screen.getAllByRole('button');
    socialIcons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-label');
    });
  });
});
```