import Link from 'next/link';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const openSocialMedia = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 footer-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 footer-links">
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-700 mb-2">イベント管理</h3>
            <Link href="/about" aria-label="イベント作成について">
              <span className="text-gray-600 hover:text-primary-600">イベント作成</span>
            </Link>
            <Link href="/features" aria-label="機能一覧">
              <span className="text-gray-600 hover:text-primary-600">機能一覧</span>
            </Link>
            <Link href="/pricing" aria-label="料金プラン">
              <span className="text-gray-600 hover:text-primary-600">料金プラン</span>
            </Link>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-700 mb-2">サポート</h3>
            <Link href="/help" aria-label="ヘルプセンター">
              <span className="text-gray-600 hover:text-primary-600">ヘルプセンター</span>
            </Link>
            <Link href="/faq" aria-label="よくある質問">
              <span className="text-gray-600 hover:text-primary-600">よくある質問</span>
            </Link>
            <Link href="/contact" aria-label="お問い合わせ">
              <span className="text-gray-600 hover:text-primary-600">お問い合わせ</span>
            </Link>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-700 mb-2">会社情報</h3>
            <Link href="/company" aria-label="運営会社">
              <span className="text-gray-600 hover:text-primary-600">運営会社</span>
            </Link>
            <Link href="/privacy" aria-label="プライバシーポリシー">
              <span className="text-gray-600 hover:text-primary-600">プライバシーポリシー</span>
            </Link>
            <Link href="/terms" aria-label="利用規約">
              <span className="text-gray-600 hover:text-primary-600">利用規約</span>
            </Link>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-700 mb-2">フォローする</h3>
            <div className="flex space-x-4 social-icons">
              <button
                aria-label="Twitter"
                data-testid="twitter-icon"
                onClick={() => openSocialMedia('https://twitter.com/eventmanager')}
                className="text-gray-600 hover:text-blue-400"
              >
                <FaTwitter size={24} />
              </button>
              <button
                aria-label="Facebook"
                data-testid="facebook-icon"
                onClick={() => openSocialMedia('https://facebook.com/eventmanager')}
                className="text-gray-600 hover:text-blue-600"
              >
                <FaFacebook size={24} />
              </button>
              <button
                aria-label="Instagram"
                data-testid="instagram-icon"
                onClick={() => openSocialMedia('https://instagram.com/eventmanager')}
                className="text-gray-600 hover:text-pink-600"
              >
                <FaInstagram size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Event Manager All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;