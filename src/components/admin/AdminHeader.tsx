"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

type AdminView = "overview" | "products" | "orders" | "inventory" | "activity" | "monitoring";

interface AdminHeaderProps {
  currentView: AdminView;
  onMenuToggle: () => void;
}

const viewTitles: Record<AdminView, string> = {
  overview: "Přehled",
  products: "Správa produktů",
  orders: "Správa objednávek",
  inventory: "Skladové zásoby",
  activity: "Aktivita administrátorů",
  monitoring: "Monitoring systému",
};

export default function AdminHeader({ currentView, onMenuToggle }: AdminHeaderProps) {
  const { data: session } = useSession();
  const t = useTranslations("admin");

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white shadow-sm border-b border-stone-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-stone-400 hover:text-stone-500 hover:bg-stone-100 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="ml-4 lg:ml-0">
            <h1 className="text-2xl font-semibold text-stone-900">{viewTitles[currentView]}</h1>
            <p className="text-sm text-stone-500 mt-1">Správa e-shopu pohřebních věnců</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-stone-400 hover:text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
            <BellIcon className="h-6 w-6" />
          </button>

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-stone-100 transition-colors">
              <UserCircleIcon className="h-8 w-8 text-stone-400" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-stone-900">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-xs text-stone-500">Administrátor</p>
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-stone-900 ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/"
                        className={`${active ? "bg-stone-100" : ""
                          } flex items-center px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors`}
                      >
                        <UserCircleIcon className="h-4 w-4 mr-3" />
                        Zobrazit web
                      </a>
                    )}
                  </Menu.Item>

                  <div className="border-t border-stone-100"></div>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        className={`${active ? "bg-stone-100" : ""
                          } flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors`}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Odhlásit se
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
